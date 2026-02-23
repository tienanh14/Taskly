import { google } from 'googleapis'

// ─── Auth ────────────────────────────────────────────────────────────────────

function getDriveClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    if (clientId && clientSecret && refreshToken) {
        try {
            const oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'https://developers.google.com/oauthplayground' // Dummy redirect but needed for setup
            )

            oauth2Client.setCredentials({
                refresh_token: refreshToken
            })

            return google.drive({ version: 'v3', auth: oauth2Client })
        } catch (e) {
            console.error('[Google Drive] OAuth2 Setup Failed', e)
        }
    }

    // Fallback to Service Account for backward compatibility
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!rawKey) {
        console.warn('[Google Drive] No Valid Auth (OAuth2 or Service Account) found.')
        return null
    }

    try {
        const credentials = JSON.parse(rawKey)
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/documents'
            ],
        })

        return google.drive({ version: 'v3', auth })
    } catch (e) {
        console.error('[Google Drive] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY', e)
        return null
    }
}

// ─── Core Folder Logic ────────────────────────────────────────────────────────

/**
 * Creates a folder on Google Drive.
 */
async function createFolder(name: string, parentId?: string) {
    const drive = getDriveClient()
    if (!drive) return null

    const res = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        },
        fields: 'id',
    })
    return res.data.id!
}

/**
 * Gets the root folder ID from environment variables.
 */
export async function getOrCreateRootFolder() {
    const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
    if (rootId) return rootId

    // Fallback/Legacy search
    const drive = getDriveClient()
    if (!drive) return 'stub-root'

    const list = await drive.files.list({
        q: "name = 'Taskly app' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id)',
        pageSize: 1,
    })

    if (list.data.files && list.data.files.length > 0) {
        return list.data.files[0].id!
    }

    return createFolder('Taskly app')
}

// ─── High Level API ──────────────────────────────────────────────────────────

/**
 * Creates a Space folder inside the Taskly Root.
 */
export async function createSpaceFolder(spaceName: string) {
    const rootId = await getOrCreateRootFolder()
    if (!rootId) return 'stub-space-id'

    const folderId = await createFolder(spaceName, rootId)
    return folderId ?? `stub-space-${Date.now()}`
}

/**
 * Creates a Project structure inside a Space folder.
 * Returns { folderId, docsFolderId, mediaFolderId }.
 */
export async function createProjectStructure(projectName: string, spaceFolderId: string) {
    const drive = getDriveClient()

    if (!drive) {
        return {
            folderId: `stub-project-${Date.now()}`,
            docsFolderId: `stub-docs-${Date.now()}`,
            mediaFolderId: `stub-media-${Date.now()}`,
        }
    }

    // Create project root folder inside space
    const folderId = await createFolder(projectName, spaceFolderId)
    if (!folderId) throw new Error('Failed to create project folder')

    // Create sub-folders
    const [docsFolderId, mediaFolderId] = await Promise.all([
        createFolder('01_Documents', folderId),
        createFolder('02_Media', folderId),
    ])

    return {
        folderId,
        docsFolderId: docsFolderId!,
        mediaFolderId: mediaFolderId!
    }
}

/**
 * Create a Google Doc inside the given folder.
 * Now using User OAuth2, so files are owned by the user and use their 15GB quota.
 */
export async function createGoogleDoc(parentFolderId: string, title: string): Promise<string> {
    const drive = getDriveClient()

    if (!drive) {
        console.log(`[STUB] Would create Doc: ${title} in ${parentFolderId}`)
        return `https://docs.google.com/document/d/stub-${Date.now()}`
    }

    try {
        const res = await drive.files.create({
            requestBody: {
                name: title,
                mimeType: 'application/vnd.google-apps.document',
                parents: [parentFolderId],
            },
            fields: 'id, webViewLink',
        })

        return res.data.webViewLink ?? ''
    } catch (err: any) {
        console.error('[Google Drive] Failed to create Doc, falling back to Markdown:', err.message)

        // Final fallback to Markdown for any other errors
        const file = await drive.files.create({
            requestBody: {
                name: `${title}.md`,
                mimeType: 'text/markdown',
                parents: [parentFolderId],
            },
            fields: 'id, webViewLink',
        })
        return file.data.webViewLink ?? ''
    }
}

/**
 * Upload a file to Google Drive.
 */
export async function uploadFile(
    parentFolderId: string,
    name: string,
    mimeType: string,
    body: any
): Promise<string> {
    const drive = getDriveClient()
    if (!drive) throw new Error('Google Drive client not initialized')

    const res = await drive.files.create({
        requestBody: {
            name,
            parents: [parentFolderId]
        },
        media: {
            mimeType,
            body
        },
        fields: 'id, webViewLink'
    })

    return res.data.webViewLink ?? ''
}

/**
 * Extract file ID from a Google Drive webViewLink or similar URL.
 */
export function extractFileId(url: string | null): string | null {
    if (!url) return null
    // Matches /d/FILE_ID/ or id=FILE_ID
    const match = url.match(/\/d\/(.*?)(\/|$|\?)/) || url.match(/id=(.*?)(&|$)/)
    return match ? match[1] : null
}

/**
 * Rename a file on Google Drive.
 */
export async function renameFile(fileId: string, newName: string) {
    const drive = getDriveClient()
    if (!drive) return

    await drive.files.update({
        fileId,
        requestBody: {
            name: newName
        }
    })
}

/**
 * Delete a file on Google Drive.
 */
export async function deleteFile(fileId: string) {
    const drive = getDriveClient()
    if (!drive) return

    try {
        await drive.files.delete({ fileId })
    } catch (err: any) {
        console.warn(`[Google Drive] Failed to delete file ${fileId}:`, err.message)
    }
}

/**
 * Parse folder IDs from a project's drive_folder_id field.
 * Format: "rootId|docsId|mediaId"
 */
export function parseFolderIds(rawId: string | null) {
    if (!rawId) return { folderId: null, docsFolderId: null, mediaFolderId: null }
    const [folderId, docsFolderId, mediaFolderId] = rawId.split('|')
    return { folderId, docsFolderId, mediaFolderId }
}
