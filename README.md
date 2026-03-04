# n8n Pachca Node

Custom n8n node for integration with the Pachca messenger API. Automate work with users, messages, chats, files, and other Pachca resources.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Resources and Operations](#resources-and-operations)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## Installation

### Automatic installation

1. Download the node archive:
```bash
wget https://github.com/pachca/n8n-nodes-pachca/releases/latest/download/pachca-node-v2.2.2.tar.gz
```

2. Extract to the custom nodes directory:
```bash
tar -xzf pachca-node-v2.2.2.tar.gz -C /path/to/n8n/custom-nodes/
```

3. Restart n8n:
```bash
docker restart n8n-container
```

### Manual installation

1. Clone the repository:
```bash
git clone https://github.com/pachca/n8n-nodes-pachca.git
cd n8n-nodes-pachca
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Restart n8n:
```bash
docker restart n8n-container
```

## Configuration

### 1. Creating credentials

1. In n8n go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Find **Pachca API** in the list
4. Fill in the fields:
   - **Base URL**: `https://api.pachca.com/api/shared/v1`
   - **Access Token**: Your Pachca API access token

### 2. Obtaining an access token

To get an access token:

1. Log in to the Pachca web app
2. Go to **Settings** → **Integrations**
3. Create a new access token
4. Copy the token and paste it into the credentials settings

> **Important**: The token must have the required permissions for the operations you plan to perform.

## Resources and Operations

### User

| Operation | Description | Method |
|-----------|-------------|--------|
| Get All | Get list of all users | GET |
| Get By ID | Get user by ID | GET |
| Create | Create new user | POST |
| Update | Update user data | PUT |
| Delete | Delete user | DELETE |

**Update parameters:**
- First Name, Last Name, Email
- Nickname, Phone Number
- Department, Title, Role
- Suspended (deactivation)
- List Tags (comma-separated tags)
- Custom Properties (additional fields)

### Message

| Operation | Description | Method |
|-----------|-------------|--------|
| Send | Send message | POST |
| Get All By Chat | Get chat messages | GET |
| Get By ID | Get message by ID | GET |
| Update | Edit message | PUT |
| Delete | Delete message | DELETE |
| Get Read Members | Get list of readers | GET |

### Chat

| Operation | Description | Method |
|-----------|-------------|--------|
| Get All | Get list of chats | GET |
| Get By ID | Get chat by ID | GET |
| Create | Create new chat | POST |
| Update | Update chat | PUT |
| Archive | Archive chat | PUT |
| Unarchive | Unarchive chat | PUT |

**Create parameters:**
- Chat Name
- Channel (channel/direct switch)
- Public (public/private switch)

### Group Tag

| Operation | Description | Method |
|-----------|-------------|--------|
| Get All | Get all tags | GET |
| Get By ID | Get tag by ID | GET |
| Create | Create new tag | POST |
| Update | Update tag | PUT |
| Delete | Delete tag | DELETE |
| Add Tags | Add tags to chat | POST |
| Remove Tag | Remove tag from chat | DELETE |

### File

| Operation | Description | Method |
|-----------|-------------|--------|
| Upload | Upload file | POST |
| Get Upload Params | Get upload parameters | POST |

**Supported file sources:**
- URL (file link)
- Binary (binary data from previous nodes)

### Custom Fields

| Operation | Description | Method |
|-----------|-------------|--------|
| Get Custom Properties | Get list of fields | GET |

### Task

| Operation | Description | Method |
|-----------|-------------|--------|
| Create | Create task | POST |

### Bot

| Operation | Description | Method |
|-----------|-------------|--------|
| Update | Update bot settings | PUT |

### Status

| Operation | Description | Method |
|-----------|-------------|--------|
| Get Profile | Get profile | GET |
| Get Status | Get status | GET |
| Update Status | Update status | PUT |
| Delete Status | Delete status | DELETE |

### Thread

| Operation | Description | Method |
|-----------|-------------|--------|
| Create Thread | Create thread | POST |
| Get Thread | Get thread | GET |

### Reactions

| Operation | Description | Method |
|-----------|-------------|--------|
| Add Reaction | Add reaction | POST |
| Delete Reaction | Delete reaction | DELETE |
| Get Reactions | Get reactions | GET |

## Usage Examples

### 1. Send a message to a chat

```json
{
  "resource": "message",
  "operation": "send",
  "chatId": 12345,
  "content": "Hello! This is an automated message from n8n."
}
```

### 2. Create a chat with settings

```json
{
  "resource": "chat",
  "operation": "create",
  "chatName": "New project",
  "channel": true,
  "public": false
}
```

### 3. Update a user

```json
{
  "resource": "user",
  "operation": "update",
  "userId": 123,
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "title": "Senior Developer",
  "role": "user",
  "listTags": "Backend, Senior",
  "customProperties": {
    "property": [
      {
        "id": 1678,
        "value": "New York"
      }
    ]
  }
}
```

### 4. Upload a file

```json
{
  "resource": "file",
  "operation": "upload",
  "fileSource": "url",
  "fileUrl": "https://example.com/document.pdf",
  "fileName": "document.pdf"
}
```

### 5. Workflow: New user notification

1. **Webhook** – receives new user data
2. **Pachca: Create User** – creates the user in Pachca
3. **Pachca: Send Message** – sends a welcome message
4. **Pachca: Create Chat** – creates a personal chat

## Troubleshooting

### "Invalid URL" error

**Problem**: API requests fail due to incorrect URL.

**Solution**:
1. Check Base URL in credentials: `https://api.pachca.com/api/shared/v1`
2. Ensure the access token is valid
3. Check token permissions

### "Request failed with status code 404"

**Problem**: Resource not found.

**Solution**:
1. Verify the resource ID
2. Ensure the token has access to the resource
3. Confirm the resource exists

### "Request failed with status code 400"

**Problem**: Invalid request parameters.

**Solution**:
1. Check required fields
2. Verify data format
3. Check API limits (text length, file size)

### Files not uploading

**Problem**: Error when uploading files.

**Solution**:
1. Check that the file URL is accessible
2. Ensure the file does not exceed size limits
3. Check file format (supported types)

### Node not showing in the list

**Problem**: Custom node does not appear in n8n.

**Solution**:
1. Ensure files are copied to the correct directory
2. Restart n8n
3. Check n8n logs for loading errors

## Support

### Getting help

- **GitHub Issues**: [Create an issue](https://github.com/pachca/n8n-nodes-pachca/issues)
- **Pachca API documentation**: [api.pachca.com](https://api.pachca.com)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)

### Reporting bugs

When reporting a bug please include:

1. n8n version
2. Node version
3. Problem description
4. Error logs
5. Steps to reproduce

### Contributing

We welcome contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a Pull Request

## License

MIT License – see the [LICENSE](LICENSE) file for details.

## Versions

### v1.0.0
- Base functionality
- Support for all main Pachca API resources
- File upload
- User and chat management

---

**Made with ❤️ for the n8n and Pachca community**
