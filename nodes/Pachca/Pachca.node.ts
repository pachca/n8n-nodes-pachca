import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionTypes,
  NodeOperationError,
} from 'n8n-workflow';

// Form templates for Pachca
const FORM_TEMPLATES: { [key: string]: any } = {
  timeoff_request: {
    title: 'Time-off request',
    close_text: 'Close',
    submit_text: 'Submit request',
    blocks: [
      {
        type: 'plain_text',
        text: 'Fill out the form to submit a time-off request. After submission, a notification will be sent to the general chat.',
      },
      {
        type: 'header',
        text: 'Basic information',
      },
      {
        type: 'date',
        name: 'date_start',
        label: 'Start date',
        required: true,
        hint: 'Select start date',
      },
      {
        type: 'date',
        name: 'date_end',
        label: 'End date',
        required: true,
        hint: 'Select end date',
      },
      {
        type: 'input',
        name: 'reason',
        label: 'Reason',
        placeholder: 'Describe the reason for time off',
        multiline: true,
        hint: 'Optional field for additional information',
      },
      {
        type: 'divider',
      },
      {
        type: 'header',
        text: 'Availability',
      },
      {
        type: 'radio',
        name: 'accessibility',
        label: 'Availability during time off',
        options: [
          {
            text: 'Fully unavailable',
            value: 'unavailable',
            description: 'Will not respond to messages and calls',
            checked: true,
          },
          {
            text: 'Phone only',
            value: 'phone_only',
            description: 'Will respond to urgent calls only',
          },
          {
            text: 'Phone and laptop',
            value: 'phone_laptop',
            description: 'Available for important matters',
          },
        ],
        required: true,
      },
    ],
  },
  feedback_form: {
    title: 'Feedback',
    close_text: 'Cancel',
    submit_text: 'Submit feedback',
    blocks: [
      {
        type: 'plain_text',
        text: 'Share your opinion about the team or project. Your feedback helps us improve.',
      },
      {
        type: 'header',
        text: 'Rating',
      },
      {
        type: 'select',
        name: 'rating',
        label: 'Overall rating',
        options: [
          { text: '⭐ Excellent (5)', value: '5' },
          { text: '👍 Good (4)', value: '4' },
          { text: '😐 Average (3)', value: '3' },
          { text: '👎 Poor (2)', value: '2' },
          { text: '💩 Very poor (1)', value: '1' },
        ],
        required: true,
        hint: 'Select a rating from 1 to 5',
      },
      {
        type: 'divider',
      },
      {
        type: 'header',
        text: 'Comments',
      },
      {
        type: 'input',
        name: 'comment',
        label: 'Your feedback',
        placeholder: 'Describe what you liked or what could be improved',
        multiline: true,
        required: true,
        hint: 'The more detail, the better',
      },
      {
        type: 'checkbox',
        name: 'categories',
        label: 'Feedback categories',
        options: [
          {
            text: 'Teamwork',
            value: 'team_work',
            description: 'Team collaboration',
          },
          {
            text: 'Processes',
            value: 'processes',
            description: 'Workflow organization',
          },
          {
            text: 'Tools',
            value: 'tools',
            description: 'Tools and technologies used',
          },
          {
            text: 'Communication',
            value: 'communication',
            description: 'Communication and information quality',
          },
        ],
      },
    ],
  },
  task_request: {
    title: 'Task request',
    close_text: 'Cancel',
    submit_text: 'Create task',
    blocks: [
      {
        type: 'plain_text',
        text: 'Create a new task for the team. Provide all necessary details for effective work.',
      },
      {
        type: 'header',
        text: 'Task description',
      },
      {
        type: 'input',
        name: 'title',
        label: 'Task title',
        placeholder: 'Brief task description',
        required: true,
        max_length: 100,
        hint: 'Max 100 characters',
      },
      {
        type: 'input',
        name: 'description',
        label: 'Detailed description',
        placeholder: 'Describe the task in detail',
        multiline: true,
        required: true,
        hint: 'Include all important details and requirements',
      },
      {
        type: 'divider',
      },
      {
        type: 'header',
        text: 'Priority and deadlines',
      },
      {
        type: 'select',
        name: 'priority',
        label: 'Priority',
        options: [
          { text: '🔥 Critical', value: 'critical' },
          { text: '⚡ High', value: 'high' },
          { text: '📋 Normal', value: 'normal', selected: true },
          { text: '📌 Low', value: 'low' },
        ],
        required: true,
      },
      {
        type: 'date',
        name: 'due_date',
        label: 'Due date',
        hint: 'When the task should be completed',
      },
      {
        type: 'divider',
      },
      {
        type: 'header',
        text: 'Assignees',
      },
      {
        type: 'input',
        name: 'assignee_emails',
        label: 'Assignee emails',
        placeholder: 'user1@company.com, user2@company.com',
        hint: 'Comma-separated email addresses',
      },
      {
        type: 'select',
        name: 'team',
        label: 'Team',
        options: [
          { text: 'Frontend', value: 'frontend' },
          { text: 'Backend', value: 'backend' },
          { text: 'Design', value: 'design' },
          { text: 'QA', value: 'qa' },
          { text: 'DevOps', value: 'devops' },
          { text: 'Product', value: 'product' },
        ],
      },
    ],
  },
  survey_form: {
    title: 'Employee survey',
    close_text: 'Cancel',
    submit_text: 'Submit answers',
    blocks: [
      {
        type: 'header',
        text: 'Feedback survey',
      },
      {
        type: 'plain_text',
        text: 'Please answer the questions honestly. Your responses will help improve the company.',
      },
      {
        type: 'radio',
        name: 'satisfaction',
        label: 'How satisfied are you with working at the company?',
        options: [
          { text: 'Very satisfied', value: 'very_satisfied' },
          { text: 'Satisfied', value: 'satisfied' },
          { text: 'Neutral', value: 'neutral' },
          { text: 'Dissatisfied', value: 'dissatisfied' },
          { text: 'Very dissatisfied', value: 'very_dissatisfied' },
        ],
        required: true,
      },
      {
        type: 'checkbox',
        name: 'improvements',
        label: 'What would you like to see improved?',
        options: [
          { text: 'Salary', value: 'salary' },
          { text: 'Work conditions', value: 'work_conditions' },
          { text: 'Team', value: 'team' },
          { text: 'Projects', value: 'projects' },
          { text: 'Training', value: 'training' },
          { text: 'Career growth', value: 'career_growth' },
        ],
      },
      {
        type: 'input',
        name: 'suggestions',
        label: 'Your suggestions',
        placeholder: 'Share ideas for improvement',
        multiline: true,
      },
    ],
  },
  access_request: {
    title: 'Access request',
    close_text: 'Cancel',
    submit_text: 'Submit request',
    blocks: [
      {
        type: 'header',
        text: 'Resource access request',
      },
      {
        type: 'input',
        name: 'employee_name',
        label: 'Employee full name',
        placeholder: 'John Doe',
        required: true,
      },
      {
        type: 'input',
        name: 'department',
        label: 'Department',
        placeholder: 'IT Department',
        required: true,
      },
      {
        type: 'checkbox',
        name: 'access_types',
        label: 'Access type',
        options: [
          { text: 'Corporate email', value: 'email' },
          { text: 'Internal systems', value: 'internal_systems' },
          { text: 'Database', value: 'database' },
          { text: 'File server', value: 'file_server' },
          { text: 'VPN access', value: 'vpn' },
          { text: 'Administrative rights', value: 'admin_rights' },
        ],
        required: true,
      },
      {
        type: 'date',
        name: 'access_start',
        label: 'Access start date',
        required: true,
      },
      {
        type: 'date',
        name: 'access_end',
        label: 'Access end date',
      },
      {
        type: 'input',
        name: 'justification',
        label: 'Justification',
        placeholder: 'Explain why access is needed',
        multiline: true,
        required: true,
      },
      {
        type: 'file_input',
        name: 'approval_doc',
        label: 'Supporting document',
        filetypes: ['pdf', 'doc', 'docx'],
        max_files: 1,
        hint: 'Upload a document confirming the need for access',
      },
    ],
  },
};

// Form validation rules
const FORM_VALIDATION_RULES: { [key: string]: any } = {
  timeoff_request: {
    date_end: (value: string, formData: any) => {
      if (new Date(value) <= new Date(formData.date_start)) {
        return 'End date must be after start date';
      }
      return null;
    },
  },
  feedback_form: {
    comment: (value: string) => {
      if (value && value.length < 10) {
        return 'Comment must be at least 10 characters';
      }
      return null;
    },
  },
  custom_form: {
    text: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Text field cannot be empty';
      }
      return null;
    },
  },
  task_request: {
    title: (value: string) => {
      if (value && value.length < 5) {
        return 'Task title must be at least 5 characters';
      }
      return null;
    },
    description: (value: string) => {
      if (value && value.length < 20) {
        return 'Description must be at least 20 characters';
      }
      return null;
    },
  },
};

export class Pachca implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pachca (beta)',
    name: 'pachca',
    icon: {
      light: 'file:Pachca_white_mark.png',
      dark: 'file:Pachca_dark_mark.png',
    },
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Integration with Pachca messenger',
    defaults: {
      name: 'Pachca',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'pachcaApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Message',
            value: 'message',
          },
          {
            name: 'Thread',
            value: 'thread',
          },
          {
            name: 'Reactions',
            value: 'reactions',
          },
          {
            name: 'Chat',
            value: 'chat',
          },
          {
            name: 'User',
            value: 'user',
          },
          {
            name: 'Group Tag',
            value: 'groupTag',
          },
          {
            name: 'Status',
            value: 'status',
          },
          {
            name: 'Custom Fields',
            value: 'customFields',
          },
          {
            name: 'Task',
            value: 'task',
          },
          {
            name: 'Bot',
            value: 'bot',
          },
          {
            name: 'File',
            value: 'file',
          },
          {
            name: 'Form',
            value: 'form',
          },
        ],
        default: 'message',
      },
      // User operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['user'],
          },
        },
        options: [
          {
            name: 'Get all users',
            value: 'getAll',
            action: 'Get all users',
            description: 'Get list of all users',
          },
          {
            name: 'Get a user',
            value: 'getById',
            action: 'Get a user',
            description: 'Get user by ID',
          },
          {
            name: 'Create a user',
            value: 'create',
            action: 'Create a user',
            description: 'Create new user (Admin/Owner tokens only)',
          },
          {
            name: 'Update a user',
            value: 'update',
            action: 'Update a user',
            description: 'Update user (Admin/Owner tokens only)',
          },
          {
            name: 'Delete a user',
            value: 'delete',
            action: 'Delete a user',
            description: 'Delete user (Admin/Owner tokens only)',
          },
        ],
        default: 'getAll',
      },
      // Message operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['message'],
          },
        },
        options: [
          {
            name: 'Send a message',
            value: 'send',
            action: 'Send a message',
            description: 'Send message',
          },
          {
            name: 'Get a message',
            value: 'getById',
            action: 'Get a message',
            description: 'Get message by ID',
          },
          {
            name: 'Get messages from a chat',
            value: 'getAll',
            action: 'Get messages from a chat',
            description: 'Get chat messages',
          },
          {
            name: 'Update a message',
            value: 'update',
            action: 'Update a message',
            description: 'Edit message',
          },
          {
            name: 'Delete a message',
            value: 'delete',
            action: 'Delete a message',
            description: 'Delete message (Admin/Owner tokens only)',
          },
          {
            name: 'Pin a message',
            value: 'pin',
            action: 'Pin a message',
            description: 'Pin message',
          },
          {
            name: 'Unpin a message',
            value: 'unpin',
            action: 'Unpin a message',
            description: 'Unpin message',
          },
          {
            name: 'Get message readers',
            value: 'getReadMembers',
            action: 'Get message readers',
            description: 'Get list of message readers',
          },
          {
            name: 'Unfurl message links',
            value: 'unfurl',
            action: 'Unfurl message links',
            description: 'Create link previews in message (unfurl)',
          },
        ],
        default: 'send',
      },
      // Chat operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['chat'],
          },
        },
        options: [
          {
            name: 'Get all chats',
            value: 'getAll',
            action: 'Get all chats',
            description: 'Get list of all chats',
          },
          {
            name: 'Get a chat',
            value: 'getById',
            action: 'Get a chat',
            description: 'Get chat by ID',
          },
          {
            name: 'Create a chat',
            value: 'create',
            action: 'Create a chat',
            description: 'Create new chat',
          },
          {
            name: 'Update a chat',
            value: 'update',
            action: 'Update a chat',
            description: 'Update chat',
          },
          {
            name: 'Archive a chat',
            value: 'archive',
            action: 'Archive a chat',
            description: 'Archive chat',
          },
          {
            name: 'Unarchive a chat',
            value: 'unarchive',
            action: 'Unarchive a chat',
            description: 'Unarchive chat',
          },
          {
            name: 'Get chat members',
            value: 'getMembers',
            action: 'Get chat members',
            description: 'Get chat members list',
          },
          {
            name: 'Add users to chat',
            value: 'addUsers',
            action: 'Add users to chat',
            description: 'Add users to chat',
          },
          {
            name: 'Remove user from chat',
            value: 'removeUser',
            action: 'Remove user from chat',
            description: 'Remove user from chat',
          },
          {
            name: 'Update user role in chat',
            value: 'updateRole',
            action: 'Update user role in chat',
            description: 'Change user role in chat',
          },
          {
            name: 'Leave a chat',
            value: 'leaveChat',
            action: 'Leave a chat',
            description: 'Leave chat',
          },
        ],
        default: 'getAll',
      },
      // Group Tag operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['groupTag'],
          },
        },
        options: [
          {
            name: 'Get all group tags',
            value: 'getAll',
            action: 'Get all group tags',
            description: 'Get list of all group tags',
          },
          {
            name: 'Get a group tag',
            value: 'getById',
            action: 'Get a group tag',
            description: 'Get group tag by ID',
          },
          {
            name: 'Create a group tag',
            value: 'create',
            action: 'Create a group tag',
            description: 'Create new group tag',
          },
          {
            name: 'Update a group tag',
            value: 'update',
            action: 'Update a group tag',
            description: 'Update group tag',
          },
          {
            name: 'Delete a group tag',
            value: 'delete',
            action: 'Delete a group tag',
            description: 'Delete group tag',
          },
          {
            name: 'Get users in group tag',
            value: 'getUsers',
            action: 'Get users in group tag',
            description: 'Get users in group tag',
          },
          {
            name: 'Add tags to chat',
            value: 'addTags',
            action: 'Add tags to chat',
            description: 'Add tags to chat',
          },
          {
            name: 'Remove tag from chat',
            value: 'removeTag',
            action: 'Remove tag from chat',
            description: 'Remove tag from chat',
          },
        ],
        default: 'getAll',
      },
      // File operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['file'],
          },
        },
        options: [
          {
            name: 'Upload a file',
            value: 'upload',
            action: 'Upload a file',
            description: 'Upload file (full flow: get params + upload)',
          },
        ],
        default: 'upload',
      },
      // Custom Fields operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['customFields'],
          },
        },
        options: [
          {
            name: 'Get custom properties',
            value: 'getCustomProperties',
            action: 'Get custom properties',
            description: 'Get list of custom fields for entity',
          },
        ],
        default: 'getCustomProperties',
      },
      // Task operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['task'],
          },
        },
        options: [
          {
            name: 'Create a task',
            value: 'create',
            action: 'Create a task',
            description: 'Create new reminder',
          },
        ],
        default: 'create',
      },
      // Bot operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['bot'],
          },
        },
        options: [
          {
            name: 'Update a bot',
            value: 'update',
            action: 'Update a bot',
            description: 'Edit bot settings',
          },
        ],
        default: 'update',
      },
      // Status operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['status'],
          },
        },
        options: [
          {
            name: 'Get my profile',
            value: 'getProfile',
            action: 'Get my profile',
            description: 'Get own profile info',
          },
          {
            name: 'Get my status',
            value: 'getStatus',
            action: 'Get my status',
            description: 'Get own status info',
          },
          {
            name: 'Set my status',
            value: 'updateStatus',
            action: 'Set my status',
            description: 'Set new status',
          },
          {
            name: 'Clear my status',
            value: 'deleteStatus',
            action: 'Clear my status',
            description: 'Delete own status',
          },
        ],
        default: 'getProfile',
      },
      // Reactions operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['reactions'],
          },
        },
        options: [
          {
            name: 'Add a reaction',
            value: 'addReaction',
            action: 'Add a reaction',
            description: 'Add reaction to message',
          },
          {
            name: 'Remove a reaction',
            value: 'deleteReaction',
            action: 'Remove a reaction',
            description: 'Remove reaction from message',
          },
          {
            name: 'Get message reactions',
            value: 'getReactions',
            action: 'Get message reactions',
            description: 'Get list of reactions on message',
          },
        ],
        default: 'addReaction',
      },
      // Thread operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['thread'],
          },
        },
        options: [
          {
            name: 'Create a thread',
            value: 'createThread',
            action: 'Create a thread',
            description: 'Create thread to message',
          },
          {
            name: 'Get a thread',
            value: 'getThread',
            action: 'Get a thread',
            description: 'Get thread info',
          },
        ],
        default: 'createThread',
      },
      // Form operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['form'],
          },
        },
        options: [
          {
            name: 'Create a form',
            value: 'createView',
            action: 'Create a form',
            description: 'Create and open modal with form',
          },
          {
            name: 'Process form submission',
            value: 'processSubmission',
            action: 'Process form submission',
            description: 'Handle form submit and send response',
          },
          {
            name: 'Get form templates',
            value: 'getTemplates',
            action: 'Get form templates',
            description: 'Get list of available form templates',
          },
        ],
        default: 'createView',
      },
      // Message parameters
      {
        displayName: 'Entity Type',
        name: 'entityType',
        type: 'options',
        options: [
          {
            name: 'Discussion',
            value: 'discussion',
            description: 'Chat or channel',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Direct message to user',
          },
          {
            name: 'Thread',
            value: 'thread',
            description: 'Thread comment',
          },
        ],
        default: 'discussion',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send'],
          },
        },
        description: 'Entity type for sending message',
      },
      {
        displayName: 'Entity ID',
        name: 'entityId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send'],
          },
        },
        description: 'Chat, user or thread ID',
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send', 'update'],
          },
        },
        description: 'Message text',
      },
      {
        displayName: 'Files',
        name: 'files',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: [],
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send', 'update'],
          },
        },
        options: [
          {
            name: 'file',
            displayName: 'File',
            values: [
              {
                displayName: 'File Key',
                name: 'key',
                type: 'string',
                default: '',
                description: 'File path/key from file upload result',
                required: true,
              },
              {
                displayName: 'File Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'File name shown to user',
                required: true,
              },
              {
                displayName: 'File Type',
                name: 'fileType',
                type: 'options',
                options: [
                  {
                    name: 'File',
                    value: 'file',
                  },
                  {
                    name: 'Image',
                    value: 'image',
                  },
                ],
                default: 'file',
                description: 'File type',
                required: true,
              },
              {
                displayName: 'File Size (bytes)',
                name: 'size',
                type: 'number',
                default: 0,
                description: 'File size in bytes',
                required: true,
              },
              {
                displayName: 'Width (px)',
                name: 'width',
                type: 'number',
                default: '',
                displayOptions: {
                  show: {
                    fileType: ['image'],
                  },
                },
                description: 'Image width in pixels (images only)',
              },
              {
                displayName: 'Height (px)',
                name: 'height',
                type: 'number',
                default: '',
                displayOptions: {
                  show: {
                    fileType: ['image'],
                  },
                },
                description: 'Image height in pixels (images only)',
              },
            ],
          },
        ],
        description: 'Attached files',
      },
      {
        displayName: 'Button Layout',
        name: 'buttonLayout',
        type: 'options',
        options: [
          {
            name: 'Single Row (all buttons in one row)',
            value: 'single_row',
          },
          {
            name: 'Multiple Rows (each button on its own row)',
            value: 'multiple_rows',
          },
          {
            name: 'Raw JSON',
            value: 'raw_json',
            description: 'Enter button JSON directly',
          },
        ],
        default: 'single_row',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send', 'update'],
          },
        },
        description: 'Button layout style',
      },
      {
        displayName: 'Buttons',
        name: 'buttons',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: [],
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send', 'update'],
            buttonLayout: ['single_row', 'multiple_rows'],
          },
        },
        options: [
          {
            name: 'button',
            displayName: 'Button',
            values: [
              {
                displayName: 'Button Text',
                name: 'text',
                type: 'string',
                default: '',
                description: 'Button text',
              },
              {
                displayName: 'Button Type',
                name: 'type',
                type: 'options',
                options: [
                  {
                    name: 'Data Button (for forms)',
                    value: 'data',
                  },
                  {
                    name: 'URL Button',
                    value: 'url',
                  },
                ],
                default: 'data',
              },
              {
                displayName: 'Data Value',
                name: 'data',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['data'],
                  },
                },
                description: 'Value for Data button (sent in webhook)',
              },
              {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['url'],
                  },
                },
                description: 'URL to open',
              },
            ],
          },
        ],
        description: 'Message buttons (Data buttons for forms, URL buttons for links)',
      },
      {
        displayName: 'Raw JSON Buttons',
        name: 'rawJsonButtons',
        type: 'json',
        default:
          '[\n  [\n    {"text": "👍 Agree", "data": "vote_yes"},\n    {"text": "❌ Decline", "data": "vote_no"}\n  ],\n  [\n    {"text": "🕒 Postpone by a week", "data": "pause_week"}\n  ],\n  [\n    {"text": "My projects", "url": "https://projects.com/list"}\n  ]\n]',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['send', 'update'],
            buttonLayout: ['raw_json'],
          },
        },
        description:
          'Raw JSON for buttons in API format: array of arrays (each row is an array of buttons). Use button array [{...}, {...}] or rows [[{...}, {...}], [{...}]]. See example above.',
      },
      {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getById', 'update', 'delete', 'pin', 'unpin', 'getReadMembers'],
          },
        },
        description: 'Message ID',
      },
      {
        displayName: 'Chat ID',
        name: 'chatId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getAll'],
          },
        },
        description: 'Chat ID to get messages from',
      },
      {
        displayName: 'Get All Users (No Limit)',
        name: 'getAllUsersNoLimit',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
          },
        },
        description: 'Get all users with full pagination (ignores per/page)',
      },
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add option',
        default: {},
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
            getAllUsersNoLimit: [false],
          },
        },
        options: [
          {
            displayName: 'Per Page',
            name: 'per',
            type: 'number',
            default: 25,
            description: 'Items per page (max 50)',
          },
          {
            displayName: 'Page',
            name: 'page',
            type: 'number',
            default: 1,
            description: 'Page number',
          },
          {
            displayName: 'Query',
            name: 'query',
            type: 'string',
            default: '',
            description: 'Search phrase to filter users',
          },
        ],
      },
      {
        displayName: 'Per Page',
        name: 'per',
        type: 'number',
        default: 25,
        displayOptions: {
          show: {
            resource: ['message', 'chat', 'groupTag', 'customFields'],
            operation: ['getAll', 'getUsers'],
          },
        },
        description: 'Items per page (max 50)',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['message', 'chat', 'groupTag', 'customFields'],
            operation: ['getAll', 'getUsers'],
          },
        },
        description: 'Page number',
      },
      // User parameters
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'number',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getById', 'update', 'delete'],
          },
        },
        default: 1,
        description: 'User ID',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'User email',
      },
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'User first name',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'User last name',
      },
      {
        displayName: 'Filter Role',
        name: 'filterRole',
        type: 'multiOptions',
        options: [
          {
            name: 'Admin',
            value: 'admin',
          },
          {
            name: 'User',
            value: 'user',
          },
          {
            name: 'Multi Guest',
            value: 'multi_guest',
          },
        ],
        default: [],
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
            getAllUsersNoLimit: [true],
          },
        },
        description: 'Filter by user roles (if not set - all roles)',
      },
      {
        displayName: 'Filter Bot',
        name: 'filterBot',
        type: 'options',
        options: [
          {
            name: 'All',
            value: 'all',
          },
          {
            name: 'Users Only',
            value: 'users',
          },
          {
            name: 'Bots Only',
            value: 'bots',
          },
        ],
        default: 'all',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
            getAllUsersNoLimit: [true],
          },
        },
        description: 'Filter by type: users or bots',
      },
      {
        displayName: 'Filter Suspended',
        name: 'filterSuspended',
        type: 'options',
        options: [
          {
            name: 'All',
            value: 'all',
          },
          {
            name: 'Active Only (suspended=false)',
            value: 'active',
          },
          {
            name: 'Suspended Only (suspended=true)',
            value: 'suspended',
          },
        ],
        default: 'all',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
            getAllUsersNoLimit: [true],
          },
        },
        description: 'Filter by block status',
      },
      {
        displayName: 'Filter Invite Status',
        name: 'filterInviteStatus',
        type: 'multiOptions',
        options: [
          {
            name: 'Confirmed',
            value: 'confirmed',
          },
          {
            name: 'Sent',
            value: 'sent',
          },
        ],
        default: [],
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['getAll'],
            getAllUsersNoLimit: [true],
          },
        },
        description: 'Filter by invitation status (if not set - all statuses)',
      },
      {
        displayName: 'Nickname',
        name: 'nickname',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'User nickname',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Phone number',
      },
      {
        displayName: 'Department',
        name: 'department',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Department',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Job title',
      },
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        options: [
          {
            name: 'Admin',
            value: 'admin',
            description: 'Administrator',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Employee',
          },
          {
            name: 'Multi Guest',
            value: 'multi_guest',
            description: 'Multi-guest',
          },
        ],
        default: 'user',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        description: 'Access level',
      },
      {
        displayName: 'Suspended',
        name: 'suspended',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['update'],
          },
        },
        description: 'User deactivation',
      },
      {
        displayName: 'List Tags',
        name: 'listTags',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        description: 'User tags (comma-separated)',
      },
      {
        displayName: 'Custom Properties',
        name: 'customProperties',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['create', 'update'],
          },
        },
        options: [
          {
            name: 'property',
            displayName: 'Property',
            values: [
              {
                displayName: 'Field ID',
                name: 'id',
                type: 'number',
                default: 0,
                description: 'Custom field identifier',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Field value',
              },
            ],
          },
        ],
        description: 'User custom fields',
      },
      // Chat parameters
      {
        displayName: 'Chat ID',
        name: 'chatId',
        type: 'number',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: [
              'getById',
              'update',
              'archive',
              'unarchive',
              'getMembers',
              'addUsers',
              'removeUser',
              'updateRole',
              'leaveChat',
            ],
          },
        },
        default: 1,
        description: 'Chat ID',
      },
      {
        displayName: 'Chat Name',
        name: 'chatName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Chat name',
      },
      {
        displayName: 'Channel',
        name: 'channel',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['create'],
          },
        },
        description: 'Create channel (true) or chat (false)',
      },
      {
        displayName: 'Public',
        name: 'public',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['create'],
          },
        },
        description: 'Open (true) or closed (false) access',
      },
      {
        displayName: 'Per Page',
        name: 'per',
        type: 'number',
        default: 25,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['getAll'],
          },
        },
        description: 'Items per page (max 50)',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['getAll'],
          },
        },
        description: 'Page number',
      },
      // Chat Members parameters
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        options: [
          {
            name: 'All',
            value: 'all',
            description: 'Any role',
          },
          {
            name: 'Owner',
            value: 'owner',
            description: 'Creator',
          },
          {
            name: 'Admin',
            value: 'admin',
            description: 'Administrator',
          },
          {
            name: 'Editor',
            value: 'editor',
            description: 'Editor',
          },
          {
            name: 'Member',
            value: 'member',
            description: 'Member/Subscriber',
          },
        ],
        default: 'all',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['getMembers'],
          },
        },
        description: 'Chat role filter',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['getMembers'],
          },
        },
        description: 'Number of members to return (max 50)',
      },
      {
        displayName: 'Cursor',
        name: 'cursor',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['getMembers'],
          },
        },
        description: 'Pagination cursor (from meta.paginate.next_page)',
      },
      {
        displayName: 'Member IDs',
        name: 'memberIds',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['addUsers'],
          },
        },
        description: 'Comma-separated user IDs (e.g. 186,187)',
      },
      {
        displayName: 'Silent',
        name: 'silent',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['addUsers'],
          },
        },
        description: 'Do not create system message about adding member',
      },
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['removeUser', 'updateRole'],
          },
        },
        description: 'User ID',
      },
      {
        displayName: 'New Role',
        name: 'newRole',
        type: 'options',
        options: [
          {
            name: 'Admin',
            value: 'admin',
            description: 'Administrator',
          },
          {
            name: 'Editor',
            value: 'editor',
            description: 'Editor (channels only)',
          },
          {
            name: 'Member',
            value: 'member',
            description: 'Member/Subscriber',
          },
        ],
        default: 'member',
        displayOptions: {
          show: {
            resource: ['chat'],
            operation: ['updateRole'],
          },
        },
        description: 'New user role',
      },
      // Group Tag parameters
      {
        displayName: 'Group Tag ID',
        name: 'groupTagId',
        type: 'number',
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['getById', 'update', 'delete', 'getUsers', 'removeTag'],
          },
        },
        default: 1,
        description: 'Group tag ID',
      },
      {
        displayName: 'Group Tag Name',
        name: 'groupTagName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Group tag name',
      },
      {
        displayName: 'Group Tag Color',
        name: 'groupTagColor',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['create', 'update'],
          },
        },
        default: '#000000',
        description: 'Group tag color (hex code)',
      },
      {
        displayName: 'Chat ID',
        name: 'groupTagChatId',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['addTags', 'removeTag'],
          },
        },
        description: 'Chat ID for tag operations',
      },
      {
        displayName: 'Group Tag IDs',
        name: 'groupTagIds',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['addTags'],
          },
        },
        description: 'Comma-separated tag IDs (e.g. 86,18)',
      },
      {
        displayName: 'Tag ID',
        name: 'tagId',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['groupTag'],
            operation: ['removeTag'],
          },
        },
        description: 'Tag ID to remove',
      },
      // File parameters
      {
        displayName: 'File Source',
        name: 'fileSource',
        type: 'options',
        options: [
          {
            name: 'URL',
            value: 'url',
            description: 'Download file from URL',
          },
          {
            name: 'Binary Data',
            value: 'binary',
            description: 'Use binary data from previous node',
          },
        ],
        default: 'url',
        displayOptions: {
          show: {
            resource: ['file'],
            operation: ['upload'],
          },
        },
        description: 'File source for upload',
      },
      {
        displayName: 'File URL',
        name: 'fileUrl',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['file'],
            operation: ['upload'],
            fileSource: ['url'],
          },
        },
        default: '',
        description: 'File URL to download and upload to Pachca',
      },
      {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['file'],
            operation: ['upload'],
            fileSource: ['binary'],
          },
        },
        default: 'data',
        description: 'Binary property name from previous node',
      },
      {
        displayName: 'File Name',
        name: 'fileName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['file'],
            operation: ['upload'],
          },
        },
        default: '',
        description: 'File name (if not set, taken from URL or binary data)',
      },
      {
        displayName: 'Content Type',
        name: 'contentType',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['file'],
            operation: ['upload'],
          },
        },
        default: 'application/octet-stream',
        description: 'File MIME type (auto-detected if not set)',
      },
      // Field parameters
      {
        displayName: 'Entity Type',
        name: 'entityType',
        type: 'options',
        options: [
          {
            name: 'User',
            value: 'User',
            description: 'Member',
          },
          {
            name: 'Task',
            value: 'Task',
            description: 'Reminder',
          },
        ],
        default: 'User',
        displayOptions: {
          show: {
            resource: ['customFields'],
            operation: ['getCustomProperties'],
          },
        },
        description: 'Entity type for custom fields',
      },
      // Task parameters
      {
        displayName: 'Task Kind',
        name: 'taskKind',
        type: 'options',
        options: [
          {
            name: 'Call',
            value: 'call',
            description: 'Call contact',
          },
          {
            name: 'Meeting',
            value: 'meeting',
            description: 'Meeting',
          },
          {
            name: 'Reminder',
            value: 'reminder',
            description: 'Simple reminder',
          },
          {
            name: 'Event',
            value: 'event',
            description: 'Event',
          },
          {
            name: 'Email',
            value: 'email',
            description: 'Send email',
          },
        ],
        default: 'reminder',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        description: 'Reminder type',
      },
      {
        displayName: 'Content',
        name: 'taskContent',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        description: 'Reminder description (uses type name if not set)',
      },
      {
        displayName: 'Due At',
        name: 'taskDueAt',
        type: 'dateTime',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        description: 'Reminder due date (ISO-8601 format)',
      },
      {
        displayName: 'Priority',
        name: 'taskPriority',
        type: 'options',
        options: [
          {
            name: 'Normal',
            value: 1,
            description: 'Normal priority',
          },
          {
            name: 'Important',
            value: 2,
            description: 'Important',
          },
          {
            name: 'Very Important',
            value: 3,
            description: 'Very important',
          },
        ],
        default: 1,
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        description: 'Reminder priority',
      },
      {
        displayName: 'Performer IDs',
        name: 'performerIds',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        description: 'Comma-separated responsible user IDs (if empty, you are set as responsible)',
      },
      {
        displayName: 'Custom Properties',
        name: 'customProperties',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: [],
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['create'],
          },
        },
        options: [
          {
            name: 'property',
            displayName: 'Property',
            values: [
              {
                displayName: 'Field ID',
                name: 'id',
                type: 'number',
                default: 0,
                description: 'Custom field ID',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Field value',
              },
            ],
          },
        ],
        description: 'Reminder custom fields',
      },
      // Bot parameters
      {
        displayName: 'Bot ID',
        name: 'botId',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['bot'],
            operation: ['update'],
          },
        },
        description: 'Bot ID to edit',
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['bot'],
            operation: ['update'],
          },
        },
        description: 'Outgoing webhook URL',
      },
      {
        displayName: 'Per Page',
        name: 'readMembersPer',
        type: 'number',
        default: 300,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getReadMembers'],
          },
        },
        description: 'Number of users to return (max 300)',
      },
      {
        displayName: 'Page',
        name: 'readMembersPage',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getReadMembers'],
          },
        },
        description: 'Page of readers to fetch',
      },
      // Link Preview parameters
      {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['unfurl'],
          },
        },
        description: 'Message ID for creating link previews (unfurl)',
      },
      {
        displayName: 'Link Previews',
        name: 'linkPreviews',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['unfurl'],
          },
        },
        options: [
          {
            name: 'preview',
            displayName: 'Preview',
            values: [
              {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                description: 'Link URL for preview (unfurl)',
                required: true,
              },
              {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                default: '',
                description: 'Link preview title',
                required: true,
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Link preview description',
                required: true,
              },
              {
                displayName: 'Image URL',
                name: 'imageUrl',
                type: 'string',
                default: '',
                description: 'Public image URL (used when no file is provided)',
              },
              {
                displayName: 'Binary Property',
                name: 'image',
                type: 'string',
                default: '',
                description: 'Binary property with image (overrides Image URL)',
              },
            ],
          },
        ],
        description:
          'Link previews to create (unfurl). Each URL must be from the message the preview is created for.',
      },
      // Profile parameters
      {
        displayName: 'Status Emoji',
        name: 'statusEmoji',
        type: 'string',
        default: '🎮',
        displayOptions: {
          show: {
            resource: ['status'],
            operation: ['updateStatus'],
          },
        },
        description: 'Status emoji',
      },
      {
        displayName: 'Status Title',
        name: 'statusTitle',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['status'],
            operation: ['updateStatus'],
          },
        },
        description: 'Status text',
      },
      {
        displayName: 'Status Expires At',
        name: 'statusExpiresAt',
        type: 'dateTime',
        default: '',
        displayOptions: {
          show: {
            resource: ['status'],
            operation: ['updateStatus'],
          },
        },
        description: 'Status TTL (optional)',
      },
      // Reactions parameters
      {
        displayName: 'Message ID',
        name: 'reactionsMessageId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['reactions'],
            operation: ['addReaction', 'deleteReaction', 'getReactions'],
          },
        },
        description: 'Message ID',
      },
      {
        displayName: 'Reaction Code',
        name: 'reactionsReactionCode',
        type: 'string',
        default: '👍',
        displayOptions: {
          show: {
            resource: ['reactions'],
            operation: ['addReaction', 'deleteReaction'],
          },
        },
        description: 'Reaction emoji (e.g. 👍, 🔥, ⭐)',
      },
      {
        displayName: 'Per Page',
        name: 'reactionsPer',
        type: 'number',
        default: 50,
        displayOptions: {
          show: {
            resource: ['reactions'],
            operation: ['getReactions'],
          },
        },
        description: 'Number of reactions to return (max 50)',
      },
      {
        displayName: 'Page',
        name: 'reactionsPage',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['reactions'],
            operation: ['getReactions'],
          },
        },
        description: 'Reactions page to fetch',
      },
      // Thread parameters
      {
        displayName: 'Message ID',
        name: 'threadMessageId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['thread'],
            operation: ['createThread'],
          },
        },
        description: 'Message ID for creating thread',
      },
      {
        displayName: 'Thread ID',
        name: 'threadThreadId',
        type: 'number',
        default: '',
        displayOptions: {
          show: {
            resource: ['thread'],
            operation: ['getThread'],
          },
        },
        description: 'Thread ID to get info for',
      },
      // Form parameters
      {
        displayName: 'Form Builder Mode',
        name: 'formBuilderMode',
        type: 'options',
        options: [
          {
            name: '📋 Use Template',
            value: 'template',
            description: 'Use preset template',
          },
          {
            name: '🎨 Visual Builder',
            value: 'builder',
            description: 'Visual form builder',
          },
          {
            name: '🔧 Raw JSON',
            value: 'json',
            description: 'Edit JSON directly',
          },
        ],
        default: 'template',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
          },
        },
        description: 'Form creation method',
      },
      {
        displayName: 'Form Template',
        name: 'formTemplate',
        type: 'options',
        options: [
          {
            name: '📋 Timeoff Request',
            value: 'timeoff_request',
            description: 'Time-off request form',
          },
          {
            name: '💬 Feedback Form',
            value: 'feedback_form',
            description: 'Feedback form',
          },
          {
            name: '📝 Task Request',
            value: 'task_request',
            description: 'Task creation form',
          },
          {
            name: '📊 Survey Form',
            value: 'survey_form',
            description: 'Survey form',
          },
          {
            name: '🔐 Access Request',
            value: 'access_request',
            description: 'Access request form',
          },
        ],
        default: 'timeoff_request',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['template'],
          },
        },
        description: 'Select form template',
      },
      // Настройки формы для визуального конструктора
      {
        displayName: 'Form Title',
        name: 'formTitle',
        type: 'string',
        default: 'My form',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['builder'],
          },
        },
        description: 'Form title (max 24 characters)',
      },
      {
        displayName: 'Close Button Text',
        name: 'closeText',
        type: 'string',
        default: 'Cancel',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['builder'],
          },
        },
        description: 'Close button text (max 24 characters)',
      },
      {
        displayName: 'Submit Button Text',
        name: 'submitText',
        type: 'string',
        default: 'Submit',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['builder'],
          },
        },
        description: 'Submit button text (max 24 characters)',
      },
      {
        displayName: 'Form Blocks',
        name: 'formBlocks',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
          sortable: true,
        },
        default: [],
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['builder'],
          },
        },
        options: [
          {
            name: 'block',
            displayName: 'Block',
            values: [
              {
                displayName: 'Block Type',
                name: 'type',
                type: 'options',
                options: [
                  { name: '📝 Header', value: 'header', description: 'Section header' },
                  { name: '📄 Plain Text', value: 'plain_text', description: 'Plain text' },
                  {
                    name: '📝 Markdown Text',
                    value: 'markdown',
                    description: 'Formatted text',
                  },
                  { name: '➖ Divider', value: 'divider', description: 'Divider' },
                  { name: '📝 Text Input', value: 'input', description: 'Text input' },
                  { name: '📋 Select Dropdown', value: 'select', description: 'Dropdown' },
                  { name: '🔘 Radio Buttons', value: 'radio', description: 'Radio buttons' },
                  { name: '☑️ Checkboxes', value: 'checkbox', description: 'Checkboxes' },
                  { name: '📅 Date Picker', value: 'date', description: 'Date picker' },
                  { name: '🕐 Time Picker', value: 'time', description: 'Time picker' },
                  { name: '📎 File Upload', value: 'file_input', description: 'File upload' },
                ],
                default: 'header',
              },
              // Общие параметры для всех блоков
              {
                displayName: 'Text Content',
                name: 'text',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['header', 'plain_text', 'markdown'],
                  },
                },
                description: 'Display text',
              },
              // Параметры для полей ввода
              {
                displayName: 'Field Name',
                name: 'name',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'],
                  },
                },
                description: 'Field name (sent in webhook)',
              },
              {
                displayName: 'Field Label',
                name: 'label',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'],
                  },
                },
                description: 'Field label',
              },
              {
                displayName: 'Required',
                name: 'required',
                type: 'boolean',
                default: false,
                displayOptions: {
                  show: {
                    type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'],
                  },
                },
                description: 'Required field',
              },
              {
                displayName: 'Hint',
                name: 'hint',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'],
                  },
                },
                description: 'Hint below field',
              },
              // Специфичные параметры для input
              {
                displayName: 'Placeholder',
                name: 'placeholder',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['input'],
                  },
                },
                description: 'Placeholder text',
              },
              {
                displayName: 'Multiline',
                name: 'multiline',
                type: 'boolean',
                default: false,
                displayOptions: {
                  show: {
                    type: ['input'],
                  },
                },
                description: 'Multiline field',
              },
              {
                displayName: 'Initial Value',
                name: 'initial_value',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['input'],
                  },
                },
                description: 'Default value',
              },
              {
                displayName: 'Min Length',
                name: 'min_length',
                type: 'number',
                default: 0,
                displayOptions: {
                  show: {
                    type: ['input'],
                  },
                },
                description: 'Min text length',
              },
              {
                displayName: 'Max Length',
                name: 'max_length',
                type: 'number',
                default: 3000,
                displayOptions: {
                  show: {
                    type: ['input'],
                  },
                },
                description: 'Max text length',
              },
              // Параметры для select, radio, checkbox
              {
                displayName: 'Options',
                name: 'options',
                type: 'fixedCollection',
                typeOptions: {
                  multipleValues: true,
                },
                default: [],
                displayOptions: {
                  show: {
                    type: ['select', 'radio', 'checkbox'],
                  },
                },
                options: [
                  {
                    name: 'option',
                    displayName: 'Option',
                    values: [
                      {
                        displayName: 'Text',
                        name: 'text',
                        type: 'string',
                        default: '',
                        description: 'Display text',
                      },
                      {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Value to submit',
                      },
                      {
                        displayName: 'Description',
                        name: 'description',
                        type: 'string',
                        default: '',
                        description: 'Option description (radio/checkbox)',
                      },
                      {
                        displayName: 'Selected',
                        name: 'selected',
                        type: 'boolean',
                        default: false,
                        description: 'Selected by default (select/radio)',
                      },
                      {
                        displayName: 'Checked',
                        name: 'checked',
                        type: 'boolean',
                        default: false,
                        description: 'Checked by default (checkbox)',
                      },
                    ],
                  },
                ],
                description: 'Choice options',
              },
              // Параметры для date
              {
                displayName: 'Initial Date',
                name: 'initial_date',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['date'],
                  },
                },
                description: 'Initial date (YYYY-MM-DD)',
              },
              // Параметры для time
              {
                displayName: 'Initial Time',
                name: 'initial_time',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['time'],
                  },
                },
                description: 'Initial time (HH:mm)',
              },
              // Параметры для file_input
              {
                displayName: 'File Types',
                name: 'filetypes',
                type: 'string',
                default: '',
                displayOptions: {
                  show: {
                    type: ['file_input'],
                  },
                },
                description: 'Allowed file types (comma-separated, e.g. pdf,jpg,png)',
              },
              {
                displayName: 'Max Files',
                name: 'max_files',
                type: 'number',
                default: 10,
                displayOptions: {
                  show: {
                    type: ['file_input'],
                  },
                },
                description: 'Max number of files',
              },
            ],
          },
        ],
        description: 'Form blocks - add elements to build the form',
      },
      // JSON редактор для продвинутых пользователей
      {
        displayName: 'Custom Form JSON',
        name: 'customFormJson',
        type: 'json',
        default:
          '{\n  "title": "My form",\n  "close_text": "Cancel",\n  "submit_text": "Submit",\n  "blocks": [\n    {\n      "type": "header",\n      "text": "Form title"\n    },\n    {\n      "type": "input",\n      "name": "field1",\n      "label": "Input field",\n      "placeholder": "Enter text",\n      "required": true\n    },\n    {\n      "type": "select",\n      "name": "choice",\n      "label": "Choose option",\n      "options": [\n        {"text": "Option 1", "value": "option1", "selected": true},\n        {"text": "Option 2", "value": "option2"}\n      ],\n      "required": true\n    }\n  ]\n}',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
            formBuilderMode: ['json'],
          },
        },
        description:
          'JSON structure for custom form. Use blocks: header, plain_text, markdown, divider, input, select, radio, checkbox, date, time, file_input',
      },
      {
        displayName: 'Trigger ID',
        name: 'triggerId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
          },
        },
        description: 'Unique event ID (from button webhook)',
      },
      {
        displayName: 'Private Metadata',
        name: 'privateMetadata',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
          },
        },
        description: 'Extra data to send on form submit (JSON string)',
      },
      {
        displayName: 'Callback ID',
        name: 'callbackId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['createView'],
          },
        },
        description: 'Form identifier for matching submitted results',
      },
      {
        displayName: 'Form Type',
        name: 'formType',
        type: 'options',
        options: [
          {
            name: '🤖 Auto-detect (recommended)',
            value: 'auto',
          },
          {
            name: '📋 Timeoff Request',
            value: 'timeoff_request',
          },
          {
            name: '💬 Feedback Form',
            value: 'feedback_form',
          },
          {
            name: '📝 Task Request',
            value: 'task_request',
          },
        ],
        default: 'auto',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['processSubmission'],
          },
        },
        description: 'Form type for processing data',
      },
      {
        displayName: 'Validation Errors',
        name: 'validationErrors',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['processSubmission'],
          },
        },
        description:
          'Validation errors to send to user (JSON object with field names and messages)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        const credentials = await this.getCredentials('pachcaApi');

        let responseData: any;

        // Выполнение операций через HTTP запросы
        switch (resource) {
          case 'user':
            switch (operation) {
              case 'getAll':
                const getAllUsersNoLimit = this.getNodeParameter(
                  'getAllUsersNoLimit',
                  i,
                  false
                ) as boolean;

                if (getAllUsersNoLimit) {
                  // Full pagination mode - get all users
                  const allUsers: any[] = [];
                  let cursor: string | undefined = undefined;
                  let hasMore = true;
                  const maxIterations = 1000; // Защита от бесконечного цикла
                  let iteration = 0;

                  while (hasMore && iteration < maxIterations) {
                    iteration++;
                    const qs: any = {
                      limit: 50, // Max limit per API
                    };

                    if (cursor) {
                      qs.cursor = cursor;
                    }

                    const response = await this.helpers.httpRequestWithAuthentication.call(
                      this,
                      'pachcaApi',
                      {
                        method: 'GET',
                        url: `${credentials?.baseUrl}/users`,
                        qs: qs,
                      }
                    );

                    // Add users from this page
                    if (response.data && Array.isArray(response.data)) {
                      allUsers.push(...response.data);

                      // Если получили меньше limit, значит это последняя страница
                      if (response.data.length < 50) {
                        hasMore = false;
                      }
                    } else {
                      // Если нет данных, выходим
                      hasMore = false;
                    }

                    // Check if there's a next page
                    if (hasMore && response.meta?.paginate?.next_page) {
                      cursor = response.meta.paginate.next_page;
                    } else {
                      hasMore = false;
                    }
                  }

                  if (iteration >= maxIterations) {
                    throw new NodeOperationError(
                      this.getNode(),
                      'Pagination loop exceeded maximum iterations. Possible infinite loop.'
                    );
                  }

                  // Применяем фильтры к полученным пользователям
                  let filteredUsers = [...allUsers];
                  const totalBeforeFilter = filteredUsers.length;

                  // Получаем параметры фильтрации
                  const filterRole = this.getNodeParameter('filterRole', i, []) as string[];
                  const filterBot = this.getNodeParameter('filterBot', i, 'all') as string;
                  const filterSuspended = this.getNodeParameter(
                    'filterSuspended',
                    i,
                    'all'
                  ) as string;
                  const filterInviteStatus = this.getNodeParameter(
                    'filterInviteStatus',
                    i,
                    []
                  ) as string[];

                  // Фильтр по роли
                  if (filterRole && filterRole.length > 0) {
                    filteredUsers = filteredUsers.filter((user) => filterRole.includes(user.role));
                  }

                  // Фильтр по типу (бот/пользователь)
                  if (filterBot !== 'all') {
                    if (filterBot === 'users') {
                      filteredUsers = filteredUsers.filter((user) => user.bot === false);
                    } else if (filterBot === 'bots') {
                      filteredUsers = filteredUsers.filter((user) => user.bot === true);
                    }
                  }

                  // Фильтр по статусу блокировки
                  if (filterSuspended !== 'all') {
                    if (filterSuspended === 'active') {
                      filteredUsers = filteredUsers.filter((user) => user.suspended === false);
                    } else if (filterSuspended === 'suspended') {
                      filteredUsers = filteredUsers.filter((user) => user.suspended === true);
                    }
                  }

                  // Фильтр по статусу приглашения
                  if (filterInviteStatus && filterInviteStatus.length > 0) {
                    filteredUsers = filteredUsers.filter((user) =>
                      filterInviteStatus.includes(user.invite_status)
                    );
                  }

                  // Return filtered users as single response
                  responseData = {
                    data: filteredUsers,
                    meta: {
                      total: filteredUsers.length,
                      total_before_filter: totalBeforeFilter,
                    },
                  };
                } else {
                  // Normal mode - single page request (Additional Options; fallback to legacy root params for backward compatibility)
                  const additionalOptions = (this.getNodeParameter('additionalOptions', i) as {
                    per?: number;
                    page?: number;
                    query?: string;
                  }) || {};
                  const per =
                    additionalOptions.per ??
                    (this.getNodeParameter('per', i, undefined) as number | undefined) ??
                    25;
                  const page =
                    additionalOptions.page ??
                    (this.getNodeParameter('page', i, undefined) as number | undefined) ??
                    1;
                  const query =
                    additionalOptions.query ??
                    (this.getNodeParameter('query', i, undefined) as string | undefined) ??
                    '';
                  responseData = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'pachcaApi',
                    {
                      method: 'GET',
                      url: `${credentials?.baseUrl}/users`,
                      qs: { per, page, query },
                    }
                  );
                }
                break;
              case 'getById':
                const userId = this.getNodeParameter('userId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/users/${userId}`,
                  }
                );
                break;
              case 'create':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/users`,
                    body: {
                      user: {
                        email: this.getNodeParameter('email', i),
                        first_name: this.getNodeParameter('firstName', i),
                        last_name: this.getNodeParameter('lastName', i),
                      },
                    },
                  }
                );
                break;
              case 'update':
                const updateUserId = this.getNodeParameter('userId', i) as number;
                const firstName = this.getNodeParameter('firstName', i) as string;
                const lastName = this.getNodeParameter('lastName', i) as string;
                const email = this.getNodeParameter('email', i) as string;
                const nickname = this.getNodeParameter('nickname', i) as string;
                const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
                const department = this.getNodeParameter('department', i) as string;
                const title = this.getNodeParameter('title', i) as string;
                const role = this.getNodeParameter('role', i) as string;
                const suspended = this.getNodeParameter('suspended', i) as boolean;
                const listTags = this.getNodeParameter('listTags', i) as string;
                const customProperties = this.getNodeParameter('customProperties', i) as any;

                // Подготавливаем объект пользователя
                const userData: any = {};

                // Добавляем поля только если они не пустые
                if (firstName) userData.first_name = firstName;
                if (lastName) userData.last_name = lastName;
                if (email) userData.email = email;
                if (nickname) userData.nickname = nickname;
                if (phoneNumber) userData.phone_number = phoneNumber;
                if (department) userData.department = department;
                if (title) userData.title = title;
                if (role) userData.role = role;
                if (suspended !== undefined) userData.suspended = suspended;

                // Обрабатываем теги
                if (listTags) {
                  userData.list_tags = listTags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);
                }

                // Обрабатываем дополнительные поля
                if (customProperties && customProperties.property) {
                  userData.custom_properties = customProperties.property.map((prop: any) => ({
                    id: prop.id,
                    value: prop.value,
                  }));
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/users/${updateUserId}`,
                    body: {
                      user: userData,
                    },
                  }
                );
                break;
              case 'delete':
                const deleteUserId = this.getNodeParameter('userId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/users/${deleteUserId}`,
                  }
                );
                break;
            }
            break;

          case 'message':
            switch (operation) {
              case 'send':
                const entityType = this.getNodeParameter('entityType', i);
                const entityId = this.getNodeParameter('entityId', i);
                const content = this.getNodeParameter('content', i);
                const files = this.getNodeParameter('files', i) as any;
                const buttonLayout = this.getNodeParameter('buttonLayout', i) as string;
                const buttons =
                  buttonLayout !== 'raw_json'
                    ? (this.getNodeParameter('buttons', i, {}) as any)
                    : undefined;

                // Валидация параметров
                if (!entityId || entityId === '') {
                  throw new NodeOperationError(
                    this.getNode(),
                    'Entity ID is required for sending messages'
                  );
                }
                if (!content || content === '') {
                  throw new NodeOperationError(
                    this.getNode(),
                    'Content is required for sending messages'
                  );
                }

                // Отладка файлов ДО обработки
                if (files) {
                }

                // Проверяем входные данные из предыдущей ноды
                const inputItem = items[i];

                // Формируем массив файлов
                const fileArray: any[] = [];

                // Если параметр files пустой, но есть данные из предыдущей ноды (file upload)
                if ((!files || !Array.isArray(files) || files.length === 0) && inputItem.json) {
                  const fileKey = inputItem.json.file_key || inputItem.json.key;
                  const fileName = inputItem.json.file_name || inputItem.json.name;
                  const fileSize = inputItem.json.file_size || inputItem.json.size || 0;
                  const contentType =
                    inputItem.json.content_type || inputItem.json.contentType || '';

                  if (fileKey && fileName) {
                    // Определяем тип файла
                    let fileType = 'file';
                    if (typeof contentType === 'string' && contentType.startsWith('image/')) {
                      fileType = 'image';
                    }

                    fileArray.push({
                      key: fileKey,
                      name: fileName,
                      file_type: fileType,
                      size: fileSize,
                    });
                  }
                }

                // Обрабатываем файлы из параметра files
                if (files && Array.isArray(files) && files.length > 0) {
                  for (const fileItem of files) {
                    let fileObj: any = null;

                    // Формат UI ноды: { file: { key, name, fileType, size } }
                    if (fileItem.file) {
                      fileObj = {
                        key: fileItem.file.key,
                        name: fileItem.file.name,
                        file_type: fileItem.file.fileType || fileItem.file.file_type,
                        size: fileItem.file.size,
                      };

                      // Добавляем размеры для изображений
                      const fileType = fileItem.file.fileType || fileItem.file.file_type;
                      if (fileType === 'image') {
                        if (fileItem.file.width) fileObj.width = fileItem.file.width;
                        if (fileItem.file.height) fileObj.height = fileItem.file.height;
                      }
                    }
                    // Формат готовых данных: { key, name, file_type/fileType, size } (напрямую)
                    else if (fileItem.key && fileItem.name) {
                      fileObj = {
                        key: fileItem.key,
                        name: fileItem.name,
                        file_type: fileItem.file_type || fileItem.fileType || 'file',
                        size: fileItem.size || 0,
                      };

                      // Добавляем размеры для изображений
                      const fileType = fileItem.file_type || fileItem.fileType;
                      if (fileType === 'image') {
                        if (fileItem.width) fileObj.width = fileItem.width;
                        if (fileItem.height) fileObj.height = fileItem.height;
                      }
                    }

                    if (fileObj && fileObj.key && fileObj.name) {
                      fileArray.push(fileObj);
                    } else {
                    }
                  }
                }

                // Формируем массив кнопок
                const buttonRows: any[] = [];
                if (buttonLayout === 'raw_json') {
                  // Raw JSON mode
                  const rawJsonButtons = this.getNodeParameter('rawJsonButtons', i, '') as string;
                  // Обрабатываем только если поле заполнено (не пустая строка по умолчанию)
                  if (rawJsonButtons && rawJsonButtons.trim() !== '') {
                    try {
                      let parsed: any;
                      if (typeof rawJsonButtons === 'string') {
                        const trimmed = rawJsonButtons.trim();
                        // Если пустая строка или "[]", считаем как пустой массив для удаления кнопок
                        if (trimmed === '' || trimmed === '[]') {
                          parsed = [];
                        } else {
                          parsed = JSON.parse(rawJsonButtons);
                        }
                      } else {
                        parsed = rawJsonButtons;
                      }
                      if (Array.isArray(parsed)) {
                        // Если пустой массив [] - это означает удаление всех кнопок
                        if (parsed.length === 0) {
                          // buttonRows остается пустым, что удалит кнопки
                        } else {
                          // Проверяем, все ли элементы - массивы (правильный формат: массив массивов)
                          const allArrays = parsed.every((item) => Array.isArray(item));

                          if (allArrays) {
                            // Правильный формат: массив массивов [[...], [...]]
                            buttonRows.push(...parsed);
                          } else {
                            // Если это массив кнопок (не массив массивов), оборачиваем в массив
                            // Например: [{...}, {...}] -> [[{...}, {...}]]
                            buttonRows.push(parsed);
                          }
                        }
                      } else {
                        throw new NodeOperationError(
                          this.getNode(),
                          'Raw JSON buttons must be an array'
                        );
                      }
                    } catch (error) {
                      throw new NodeOperationError(
                        this.getNode(),
                        `Invalid JSON for buttons: ${error instanceof Error ? error.message : String(error)}`
                      );
                    }
                  }
                } else if (buttons) {
                  // Поддержка старого формата (buttonRow)
                  if (buttons.buttonRow && Array.isArray(buttons.buttonRow)) {
                    const row: any[] = [];
                    for (const button of buttons.buttonRow) {
                      if (button.type === 'data') {
                        row.push({
                          text: button.text,
                          data: button.data,
                        });
                      } else if (button.type === 'url') {
                        row.push({
                          text: button.text,
                          url: button.url,
                        });
                      }
                    }
                    if (row.length > 0) {
                      buttonRows.push(row);
                    }
                  }
                  // Поддержка формата { "button": [...] }
                  else if (buttons.button && Array.isArray(buttons.button)) {
                    if (buttonLayout === 'single_row') {
                      // Все кнопки в одну строку
                      const row: any[] = [];
                      for (const button of buttons.button) {
                        if (button.type === 'data') {
                          row.push({
                            text: button.text,
                            data: button.data,
                          });
                        } else if (button.type === 'url') {
                          row.push({
                            text: button.text,
                            url: button.url,
                          });
                        }
                      }
                      if (row.length > 0) {
                        buttonRows.push(row);
                      }
                    } else if (buttonLayout === 'multiple_rows') {
                      // Каждая кнопка в отдельную строку
                      for (const button of buttons.button) {
                        const row: any[] = [];
                        if (button.type === 'data') {
                          row.push({
                            text: button.text,
                            data: button.data,
                          });
                        } else if (button.type === 'url') {
                          row.push({
                            text: button.text,
                            url: button.url,
                          });
                        }
                        if (row.length > 0) {
                          buttonRows.push(row);
                        }
                      }
                    }
                    // Поддержка нового формата (массив кнопок)
                    else if (Array.isArray(buttons) && buttons.length > 0) {
                      if (buttonLayout === 'single_row') {
                        // Все кнопки в одну строку
                        const row: any[] = [];
                        for (const buttonItem of buttons) {
                          if (buttonItem.button) {
                            const button = buttonItem.button;
                            if (button.type === 'data') {
                              row.push({
                                text: button.text,
                                data: button.data,
                              });
                            } else if (button.type === 'url') {
                              row.push({
                                text: button.text,
                                url: button.url,
                              });
                            }
                          }
                        }
                        if (row.length > 0) {
                          buttonRows.push(row);
                        }
                      } else if (buttonLayout === 'multiple_rows') {
                        // Каждая кнопка в отдельную строку
                        for (const buttonItem of buttons) {
                          if (buttonItem.button) {
                            const button = buttonItem.button;
                            const row: any[] = [];
                            if (button.type === 'data') {
                              row.push({
                                text: button.text,
                                data: button.data,
                              });
                            } else if (button.type === 'url') {
                              row.push({
                                text: button.text,
                                url: button.url,
                              });
                            }
                            if (row.length > 0) {
                              buttonRows.push(row);
                            }
                          }
                        }
                      }
                    }
                  }
                }

                const messageBody: any = {
                  message: {
                    entity_type: entityType,
                    entity_id: entityId,
                    content: content,
                  },
                };

                // Добавляем файлы если есть
                if (fileArray.length > 0) {
                  messageBody.message.files = fileArray;
                } else {
                }

                // Добавляем кнопки
                // В raw_json режиме всегда передаем buttons (даже пустой массив [] для удаления кнопок)
                if (buttonLayout === 'raw_json') {
                  // Всегда передаем buttons в raw_json режиме (даже если пустой массив)
                  messageBody.message.buttons = buttonRows;
                } else if (buttonRows.length > 0) {
                  messageBody.message.buttons = buttonRows;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/messages`,
                    body: messageBody,
                  }
                );
                break;
              case 'getById':
                const messageId = this.getNodeParameter('messageId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/messages/${messageId}`,
                  }
                );
                break;
              case 'getAll':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/messages`,
                    qs: {
                      chat_id: this.getNodeParameter('chatId', i),
                      per: this.getNodeParameter('per', i, 25),
                      page: this.getNodeParameter('page', i, 1),
                    },
                  }
                );
                break;
              case 'update':
                const updateMessageId = this.getNodeParameter('messageId', i) as number;
                const updateContent = this.getNodeParameter('content', i);
                const updateFiles = this.getNodeParameter('files', i) as any;
                const updateButtonLayout = this.getNodeParameter('buttonLayout', i) as string;
                const updateButtons =
                  updateButtonLayout !== 'raw_json'
                    ? (this.getNodeParameter('buttons', i, {}) as any)
                    : undefined;

                // Отладка файлов для обновления

                // Проверяем входные данные из предыдущей ноды
                const updateInputItem = items[i];

                // Формируем массив файлов для обновления
                const updateFileArray: any[] = [];

                // Если параметр updateFiles пустой, но есть данные из предыдущей ноды (file upload)
                if (
                  (!updateFiles || !Array.isArray(updateFiles) || updateFiles.length === 0) &&
                  updateInputItem.json
                ) {
                  const fileKey = updateInputItem.json.file_key || updateInputItem.json.key;
                  const fileName = updateInputItem.json.file_name || updateInputItem.json.name;
                  const fileSize = updateInputItem.json.file_size || updateInputItem.json.size || 0;
                  const contentType =
                    updateInputItem.json.content_type || updateInputItem.json.contentType || '';

                  if (fileKey && fileName) {
                    // Определяем тип файла
                    let fileType = 'file';
                    if (typeof contentType === 'string' && contentType.startsWith('image/')) {
                      fileType = 'image';
                    }

                    updateFileArray.push({
                      key: fileKey,
                      name: fileName,
                      file_type: fileType,
                      size: fileSize,
                    });
                  }
                }

                // Обрабатываем файлы из параметра updateFiles
                if (updateFiles && Array.isArray(updateFiles) && updateFiles.length > 0) {
                  for (const fileItem of updateFiles) {
                    let fileObj: any = null;

                    // Формат UI ноды: { file: { key, name, fileType, size } }
                    if (fileItem.file) {
                      fileObj = {
                        key: fileItem.file.key,
                        name: fileItem.file.name,
                        file_type: fileItem.file.fileType || fileItem.file.file_type,
                        size: fileItem.file.size,
                      };

                      // Добавляем размеры для изображений
                      const fileType = fileItem.file.fileType || fileItem.file.file_type;
                      if (fileType === 'image') {
                        if (fileItem.file.width) fileObj.width = fileItem.file.width;
                        if (fileItem.file.height) fileObj.height = fileItem.file.height;
                      }
                    }
                    // Формат готовых данных: { key, name, file_type/fileType, size } (напрямую)
                    else if (fileItem.key && fileItem.name) {
                      fileObj = {
                        key: fileItem.key,
                        name: fileItem.name,
                        file_type: fileItem.file_type || fileItem.fileType || 'file',
                        size: fileItem.size || 0,
                      };

                      // Добавляем размеры для изображений
                      const fileType = fileItem.file_type || fileItem.fileType;
                      if (fileType === 'image') {
                        if (fileItem.width) fileObj.width = fileItem.width;
                        if (fileItem.height) fileObj.height = fileItem.height;
                      }
                    }

                    if (fileObj && fileObj.key && fileObj.name) {
                      updateFileArray.push(fileObj);
                    } else {
                    }
                  }
                }

                // Формируем массив кнопок для обновления
                const updateButtonRows: any[] = [];
                if (updateButtonLayout === 'raw_json') {
                  // Raw JSON mode
                  const rawJsonButtons = this.getNodeParameter('rawJsonButtons', i, '') as string;
                  // Обрабатываем только если поле заполнено (не пустая строка по умолчанию)
                  if (rawJsonButtons && rawJsonButtons.trim() !== '') {
                    try {
                      let parsed: any;
                      if (typeof rawJsonButtons === 'string') {
                        const trimmed = rawJsonButtons.trim();
                        // Если пустая строка или "[]", считаем как пустой массив для удаления кнопок
                        if (trimmed === '' || trimmed === '[]') {
                          parsed = [];
                        } else {
                          parsed = JSON.parse(rawJsonButtons);
                        }
                      } else {
                        parsed = rawJsonButtons;
                      }
                      if (Array.isArray(parsed)) {
                        // Если пустой массив [] - это означает удаление всех кнопок
                        if (parsed.length === 0) {
                          // updateButtonRows остается пустым, что удалит кнопки
                        } else {
                          // Проверяем, все ли элементы - массивы (правильный формат: массив массивов)
                          const allArrays = parsed.every((item) => Array.isArray(item));

                          if (allArrays) {
                            // Правильный формат: массив массивов [[...], [...]]
                            updateButtonRows.push(...parsed);
                          } else {
                            // Если это массив кнопок (не массив массивов), оборачиваем в массив
                            // Например: [{...}, {...}] -> [[{...}, {...}]]
                            updateButtonRows.push(parsed);
                          }
                        }
                      } else {
                        throw new NodeOperationError(
                          this.getNode(),
                          'Raw JSON buttons must be an array'
                        );
                      }
                    } catch (error) {
                      throw new NodeOperationError(
                        this.getNode(),
                        `Invalid JSON for buttons: ${error instanceof Error ? error.message : String(error)}`
                      );
                    }
                  }
                } else if (updateButtons) {
                  // Обратная совместимость: проверяем старую структуру buttonRow
                  if (updateButtons.buttonRow && Array.isArray(updateButtons.buttonRow)) {
                    const row: any[] = [];
                    for (const button of updateButtons.buttonRow) {
                      if (button.type === 'data') {
                        row.push({
                          text: button.text,
                          data: button.data,
                        });
                      } else if (button.type === 'url') {
                        row.push({
                          text: button.text,
                          url: button.url,
                        });
                      }
                    }
                    if (row.length > 0) {
                      updateButtonRows.push(row);
                    }
                  }
                  // Поддержка формата { "button": [...] }
                  else if (updateButtons.button && Array.isArray(updateButtons.button)) {
                    if (updateButtonLayout === 'single_row') {
                      // Все кнопки в одну строку
                      const row: any[] = [];
                      for (const button of updateButtons.button) {
                        if (button.type === 'data') {
                          row.push({
                            text: button.text,
                            data: button.data,
                          });
                        } else if (button.type === 'url') {
                          row.push({
                            text: button.text,
                            url: button.url,
                          });
                        }
                      }
                      if (row.length > 0) {
                        updateButtonRows.push(row);
                      }
                    } else if (updateButtonLayout === 'multiple_rows') {
                      // Каждая кнопка в отдельную строку
                      for (const button of updateButtons.button) {
                        const row: any[] = [];
                        if (button.type === 'data') {
                          row.push({
                            text: button.text,
                            data: button.data,
                          });
                        } else if (button.type === 'url') {
                          row.push({
                            text: button.text,
                            url: button.url,
                          });
                        }
                        if (row.length > 0) {
                          updateButtonRows.push(row);
                        }
                      }
                    }
                    // Новая структура с buttonLayout
                    else if (Array.isArray(updateButtons) && updateButtons.length > 0) {
                      if (updateButtonLayout === 'single_row') {
                        // Все кнопки в одну строку
                        const row: any[] = [];
                        for (const buttonItem of updateButtons) {
                          if (buttonItem.button) {
                            const button = buttonItem.button;
                            if (button.type === 'data') {
                              row.push({
                                text: button.text,
                                data: button.data,
                              });
                            } else if (button.type === 'url') {
                              row.push({
                                text: button.text,
                                url: button.url,
                              });
                            }
                          }
                        }
                        if (row.length > 0) {
                          updateButtonRows.push(row);
                        }
                      } else if (updateButtonLayout === 'multiple_rows') {
                        // Каждая кнопка в отдельную строку
                        for (const buttonItem of updateButtons) {
                          if (buttonItem.button) {
                            const button = buttonItem.button;
                            const row: any[] = [];
                            if (button.type === 'data') {
                              row.push({
                                text: button.text,
                                data: button.data,
                              });
                            } else if (button.type === 'url') {
                              row.push({
                                text: button.text,
                                url: button.url,
                              });
                            }
                            if (row.length > 0) {
                              updateButtonRows.push(row);
                            }
                          }
                        }
                      }
                    }
                  }
                }

                // Отладочная информация для update

                // Формируем тело запроса для обновления
                const updateMessageBody: any = {
                  message: {},
                };

                // Добавляем контент если указан
                if (updateContent) {
                  updateMessageBody.message.content = updateContent;
                }

                // Добавляем файлы если есть
                if (updateFileArray.length > 0) {
                  updateMessageBody.message.files = updateFileArray;
                }

                // Добавляем кнопки
                // В raw_json режиме всегда передаем buttons (даже пустой массив [] для удаления кнопок)
                if (updateButtonLayout === 'raw_json') {
                  // Всегда передаем buttons в raw_json режиме (даже если пустой массив)
                  updateMessageBody.message.buttons = updateButtonRows;
                } else if (updateButtonRows.length > 0) {
                  updateMessageBody.message.buttons = updateButtonRows;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/messages/${updateMessageId}`,
                    body: updateMessageBody,
                  }
                );
                break;
              case 'delete':
                const deleteMessageId = this.getNodeParameter('messageId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/messages/${deleteMessageId}`,
                  }
                );
                break;
              case 'pin':
                const pinMessageId = this.getNodeParameter('messageId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/messages/${pinMessageId}/pin`,
                  }
                );
                break;
              case 'unpin':
                const unpinMessageId = this.getNodeParameter('messageId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/messages/${unpinMessageId}/pin`,
                  }
                );
                break;
              case 'getReadMembers':
                const getReadMembersMessageId = this.getNodeParameter('messageId', i) as number;
                const readMembersPer = this.getNodeParameter('readMembersPer', i) as number;
                const readMembersPage = this.getNodeParameter('readMembersPage', i) as number;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/messages/${getReadMembersMessageId}/read_member_ids`,
                    qs: {
                      per: readMembersPer,
                      page: readMembersPage,
                    },
                  }
                );
                break;
              case 'unfurl':
                const linkPreviewMessageId = this.getNodeParameter('messageId', i) as number;
                const linkPreviews = this.getNodeParameter('linkPreviews', i) as any;

                // Валидация параметров
                if (!linkPreviewMessageId) {
                  throw new NodeOperationError(
                    this.getNode(),
                    'Message ID is required for unfurling links'
                  );
                }

                if (
                  !linkPreviews ||
                  !linkPreviews.preview ||
                  !Array.isArray(linkPreviews.preview) ||
                  linkPreviews.preview.length === 0
                ) {
                  throw new NodeOperationError(
                    this.getNode(),
                    'At least one link preview is required for unfurling'
                  );
                }

                // Формируем объект link_previews
                const linkPreviewsObject: any = {};

                for (const preview of linkPreviews.preview) {
                  const url = preview.url;
                  const title = preview.title;
                  const description = preview.description;
                  const imageUrl = preview.imageUrl;
                  const image = preview.image;

                  // Валидация обязательных полей
                  if (!url || !title || !description) {
                    throw new NodeOperationError(
                      this.getNode(),
                      'URL, title and description are required for each link preview'
                    );
                  }

                  const previewObject: any = {
                    title: title,
                    description: description,
                  };

                  // Добавляем изображение (приоритет у загруженного файла)
                  if (image && image !== '') {
                    // Обработка загруженного файла
                    const binaryData = await this.helpers.getBinaryDataBuffer(i, image);
                    if (!binaryData) {
                      throw new NodeOperationError(
                        this.getNode(),
                        `No binary data found in property "${image}"`
                      );
                    }

                    const fileData = binaryData;
                    const item = this.getInputData()[i];
                    let fileName = 'image.jpg';
                    let contentType = 'image/jpeg';

                    if (item.binary && item.binary[image]) {
                      const binaryInfo = item.binary[image];
                      fileName = binaryInfo.fileName || 'image.jpg';
                      contentType = binaryInfo.mimeType || 'image/jpeg';
                    }

                    // Получаем параметры загрузки
                    const uploadParams = await this.helpers.httpRequestWithAuthentication.call(
                      this,
                      'pachcaApi',
                      {
                        method: 'POST',
                        url: `${credentials?.baseUrl}/uploads`,
                        body: {
                          filename: fileName,
                          content_type: contentType,
                        },
                      }
                    );

                    // Загружаем файл на сервер
                    const uploadResponse = await this.helpers.httpRequest.call(this, {
                      method: 'POST',
                      url: uploadParams.upload_url,
                      body: fileData,
                      headers: uploadParams.upload_headers,
                    });

                    // Проверяем успешность загрузки
                    if (uploadResponse && typeof uploadResponse === 'object') {
                      const status =
                        (uploadResponse as any).status || (uploadResponse as any).statusCode;
                      if (status && status >= 400) {
                        throw new NodeOperationError(
                          this.getNode(),
                          `File upload failed with status ${status}`
                        );
                      }
                    }

                    previewObject.image = {
                      key: uploadParams.key,
                      name: fileName,
                      size: fileData.length.toString(),
                    };
                  } else if (imageUrl) {
                    previewObject.image_url = imageUrl;
                  }

                  linkPreviewsObject[url] = previewObject;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/messages/${linkPreviewMessageId}/link_previews`,
                    body: {
                      link_previews: linkPreviewsObject,
                    },
                  }
                );
                break;
            }
            break;

          case 'chat':
            switch (operation) {
              case 'getAll':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/chats`,
                    qs: {
                      per: this.getNodeParameter('per', i, 25),
                      page: this.getNodeParameter('page', i, 1),
                    },
                  }
                );
                break;
              case 'getById':
                const chatId = this.getNodeParameter('chatId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/chats/${chatId}`,
                  }
                );
                break;
              case 'create':
                const chatName = this.getNodeParameter('chatName', i) as string;
                const channel = this.getNodeParameter('channel', i) as boolean;
                const publicChat = this.getNodeParameter('public', i) as boolean;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/chats`,
                    body: {
                      chat: {
                        name: chatName,
                        channel: channel,
                        public: publicChat,
                      },
                    },
                  }
                );
                break;
              case 'update':
                const updateChatId = this.getNodeParameter('chatId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/chats/${updateChatId}`,
                    body: {
                      chat: {
                        name: this.getNodeParameter('chatName', i),
                      },
                    },
                  }
                );
                break;
              case 'archive':
                const archiveChatId = this.getNodeParameter('chatId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/chats/${archiveChatId}/archive`,
                  }
                );
                break;
              case 'unarchive':
                const unarchiveChatId = this.getNodeParameter('chatId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/chats/${unarchiveChatId}/unarchive`,
                  }
                );
                break;
              case 'getMembers':
                const membersChatId = this.getNodeParameter('chatId', i) as number;
                const role = this.getNodeParameter('role', i) as string;
                const limit = this.getNodeParameter('limit', i) as number;
                const cursor = this.getNodeParameter('cursor', i) as string;

                const membersQuery: any = {};
                if (role && role !== 'all') {
                  membersQuery.role = role;
                }
                if (limit) {
                  membersQuery.limit = limit;
                }
                if (cursor) {
                  membersQuery.cursor = cursor;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/chats/${membersChatId}/members`,
                    qs: membersQuery,
                  }
                );
                break;
              case 'addUsers':
                const addUsersChatId = this.getNodeParameter('chatId', i) as number;
                const memberIds = this.getNodeParameter('memberIds', i) as string;
                const silent = this.getNodeParameter('silent', i) as boolean;

                const userIdsArray = memberIds
                  .split(',')
                  .map((id) => parseInt(id.trim()))
                  .filter((id) => !isNaN(id));

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/chats/${addUsersChatId}/members`,
                    body: {
                      member_ids: userIdsArray,
                      silent: silent,
                    },
                  }
                );
                break;
              case 'removeUser':
                const removeUserChatId = this.getNodeParameter('chatId', i) as number;
                const userId = this.getNodeParameter('userId', i) as number;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/chats/${removeUserChatId}/members/${userId}`,
                  }
                );
                break;
              case 'updateRole':
                const updateRoleChatId = this.getNodeParameter('chatId', i) as number;
                const updateUserId = this.getNodeParameter('userId', i) as number;
                const newRole = this.getNodeParameter('newRole', i) as string;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/chats/${updateRoleChatId}/members/${updateUserId}`,
                    body: {
                      role: newRole,
                    },
                  }
                );
                break;
              case 'leaveChat':
                const leaveChatId = this.getNodeParameter('chatId', i) as number;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/chats/${leaveChatId}/leave`,
                  }
                );
                break;
            }
            break;

          case 'groupTag':
            switch (operation) {
              case 'getAll':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/group_tags`,
                    qs: {
                      per: this.getNodeParameter('per', i, 25),
                      page: this.getNodeParameter('page', i, 1),
                    },
                  }
                );
                break;
              case 'getById':
                const groupTagId = this.getNodeParameter('groupTagId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/group_tags/${groupTagId}`,
                  }
                );
                break;
              case 'create':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/group_tags`,
                    body: {
                      group_tag: {
                        name: this.getNodeParameter('groupTagName', i),
                        color: this.getNodeParameter('groupTagColor', i),
                      },
                    },
                  }
                );
                break;
              case 'update':
                const updateGroupTagId = this.getNodeParameter('groupTagId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/group_tags/${updateGroupTagId}`,
                    body: {
                      group_tag: {
                        name: this.getNodeParameter('groupTagName', i),
                        color: this.getNodeParameter('groupTagColor', i),
                      },
                    },
                  }
                );
                break;
              case 'delete':
                const deleteGroupTagId = this.getNodeParameter('groupTagId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/group_tags/${deleteGroupTagId}`,
                  }
                );
                break;
              case 'getUsers':
                const getUsersGroupTagId = this.getNodeParameter('groupTagId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/group_tags/${getUsersGroupTagId}/users`,
                    qs: {
                      per: this.getNodeParameter('per', i, 25),
                      page: this.getNodeParameter('page', i, 1),
                    },
                  }
                );
                break;
              case 'addTags':
                const addTagsChatId = this.getNodeParameter('groupTagChatId', i) as number;
                const groupTagIds = this.getNodeParameter('groupTagIds', i) as string;

                const tagIdsArray = groupTagIds
                  .split(',')
                  .map((id) => parseInt(id.trim()))
                  .filter((id) => !isNaN(id));

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/chats/${addTagsChatId}/group_tags`,
                    body: {
                      group_tag_ids: tagIdsArray,
                    },
                  }
                );
                break;
              case 'removeTag':
                const removeTagChatId = this.getNodeParameter('groupTagChatId', i) as number;
                const tagId = this.getNodeParameter('tagId', i) as number;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/chats/${removeTagChatId}/group_tags/${tagId}`,
                  }
                );
                break;
            }
            break;

          case 'file':
            switch (operation) {
              case 'upload':
                const fileSource = this.getNodeParameter('fileSource', i) as string;
                let fileName = this.getNodeParameter('fileName', i) as string;
                let contentType = this.getNodeParameter('contentType', i) as string;
                let fileData: Buffer;

                if (fileSource === 'url') {
                  // Загружаем файл по URL
                  const fileUrl = this.getNodeParameter('fileUrl', i) as string;
                  if (!fileUrl) {
                    throw new NodeOperationError(
                      this.getNode(),
                      'File URL is required when using URL source'
                    );
                  }

                  // Скачиваем файл
                  const fileResponse = await this.helpers.httpRequest.call(this, {
                    method: 'GET',
                    url: fileUrl,
                  });

                  fileData = Buffer.from(fileResponse);

                  // Определяем имя файла из URL если не указано
                  if (!fileName) {
                    const urlPath = new URL(fileUrl).pathname;
                    fileName = urlPath.split('/').pop() || 'file';
                  }

                  // Определяем content type если не указан
                  if (contentType === 'application/octet-stream') {
                    const extension = fileName.split('.').pop()?.toLowerCase();
                    const mimeTypes: { [key: string]: string } = {
                      jpg: 'image/jpeg',
                      jpeg: 'image/jpeg',
                      png: 'image/png',
                      gif: 'image/gif',
                      pdf: 'application/pdf',
                      doc: 'application/msword',
                      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      txt: 'text/plain',
                      csv: 'text/csv',
                      json: 'application/json',
                    };
                    contentType = mimeTypes[extension || ''] || 'application/octet-stream';
                  }
                } else {
                  // Используем бинарные данные из предыдущего узла
                  const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                  const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

                  if (!binaryData) {
                    throw new NodeOperationError(
                      this.getNode(),
                      `No binary data found in property "${binaryProperty}"`
                    );
                  }

                  fileData = binaryData;

                  // Получаем метаданные бинарных данных
                  const item = this.getInputData()[i];
                  if (item.binary && item.binary[binaryProperty]) {
                    const binaryInfo = item.binary[binaryProperty];

                    // Используем имя файла из бинарных данных если не указано
                    if (!fileName && binaryInfo.fileName) {
                      fileName = binaryInfo.fileName;
                    }

                    // Используем content type из бинарных данных если не указан
                    if (contentType === 'application/octet-stream' && binaryInfo.mimeType) {
                      contentType = binaryInfo.mimeType;
                    }
                  }
                }

                if (!fileName) {
                  fileName = 'file';
                }

                // Получаем параметры загрузки
                const requestUrl = `${credentials?.baseUrl}/uploads`;
                const requestBody = {
                  filename: fileName,
                  content_type: contentType,
                };

                let uploadParams;
                try {
                  uploadParams = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'pachcaApi',
                    {
                      method: 'POST',
                      url: requestUrl,
                      body: requestBody,
                    }
                  );
                } catch (error) {
                  // Попробуем без body
                  try {
                    uploadParams = await this.helpers.httpRequestWithAuthentication.call(
                      this,
                      'pachcaApi',
                      {
                        method: 'POST',
                        url: requestUrl,
                      }
                    );
                  } catch (error2) {
                    throw error; // Бросаем первую ошибку
                  }
                }

                // Проверяем структуру ответа - возможно данные приходят напрямую
                const params = uploadParams?.data || uploadParams;

                if (!params) {
                  throw new NodeOperationError(this.getNode(), 'No upload params in response');
                }

                if (!params.direct_url) {
                  throw new NodeOperationError(
                    this.getNode(),
                    'No direct_url in upload params response. Response structure: ' +
                      JSON.stringify(params)
                  );
                }

                // Загружаем файл на direct_url

                // Загружаем файл (без авторизации, как указано в документации)

                try {
                  // Создаем multipart/form-data вручную без внешних зависимостей
                  const boundary =
                    '----WebKitFormBoundary' + Math.random().toString(36).substring(2, 15);
                  const parts: Buffer[] = [];

                  // Добавляем параметры в правильном порядке (файл должен быть последним для S3)
                  const fields = [
                    { name: 'Content-Disposition', value: params['Content-Disposition'] },
                    { name: 'acl', value: params.acl },
                    { name: 'policy', value: params.policy },
                    { name: 'x-amz-credential', value: params['x-amz-credential'] },
                    { name: 'x-amz-algorithm', value: params['x-amz-algorithm'] },
                    { name: 'x-amz-date', value: params['x-amz-date'] },
                    { name: 'x-amz-signature', value: params['x-amz-signature'] },
                    { name: 'key', value: params.key },
                  ];

                  for (const field of fields) {
                    parts.push(Buffer.from(`--${boundary}\r\n`));
                    parts.push(
                      Buffer.from(`Content-Disposition: form-data; name="${field.name}"\r\n\r\n`)
                    );
                    parts.push(Buffer.from(`${field.value}\r\n`));
                  }

                  // Добавляем файл последним
                  parts.push(Buffer.from(`--${boundary}\r\n`));
                  parts.push(
                    Buffer.from(
                      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`
                    )
                  );
                  parts.push(Buffer.from(`Content-Type: ${contentType}\r\n\r\n`));
                  parts.push(fileData);
                  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

                  const multipartBody = Buffer.concat(parts);

                  responseData = await this.helpers.httpRequest.call(this, {
                    method: 'POST',
                    url: params.direct_url,
                    body: multipartBody,
                    headers: {
                      'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    },
                  });
                } catch (error) {
                  throw error;
                }

                // Формируем итоговую ссылку на файл
                const fileKey = params.key.replace('${filename}', fileName);

                // Возвращаем информацию о загруженном файле
                responseData = {
                  success: true,
                  file_key: fileKey,
                  file_name: fileName,
                  content_type: contentType,
                  upload_params: params,
                };
                break;
            }
            break;

          case 'customFields':
            switch (operation) {
              case 'getCustomProperties':
                const entityType = this.getNodeParameter('entityType', i) as string;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/custom_properties`,
                    qs: {
                      entity_type: entityType,
                    },
                  }
                );
                break;
            }
            break;

          case 'task':
            switch (operation) {
              case 'create':
                const taskKind = this.getNodeParameter('taskKind', i) as string;
                const taskContent = this.getNodeParameter('taskContent', i) as string;
                const taskDueAt = this.getNodeParameter('taskDueAt', i) as string;
                const taskPriority = this.getNodeParameter('taskPriority', i) as number;
                const performerIds = this.getNodeParameter('performerIds', i) as string;
                const customProperties = this.getNodeParameter('customProperties', i) as any;

                const taskData: any = {
                  kind: taskKind,
                };

                if (taskContent) {
                  taskData.content = taskContent;
                }

                if (taskDueAt) {
                  taskData.due_at = taskDueAt;
                }

                if (taskPriority) {
                  taskData.priority = taskPriority;
                }

                if (performerIds) {
                  const performerIdsArray = performerIds
                    .split(',')
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  if (performerIdsArray.length > 0) {
                    taskData.performer_ids = performerIdsArray;
                  }
                }

                if (customProperties && customProperties.length > 0) {
                  taskData.custom_properties = customProperties;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/tasks`,
                    body: {
                      task: taskData,
                    },
                  }
                );
                break;
            }
            break;

          case 'bot':
            switch (operation) {
              case 'update':
                const botId = this.getNodeParameter('botId', i) as number;
                const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/bots/${botId}`,
                    body: {
                      bot: {
                        webhook: {
                          outgoing_url: webhookUrl,
                        },
                      },
                    },
                  }
                );
                break;
            }
            break;

          case 'status':
            switch (operation) {
              case 'getProfile':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/profile`,
                  }
                );
                break;
              case 'getStatus':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/profile/status`,
                  }
                );
                break;
              case 'updateStatus':
                const statusEmoji = this.getNodeParameter('statusEmoji', i) as string;
                const statusTitle = this.getNodeParameter('statusTitle', i) as string;
                const statusExpiresAt = this.getNodeParameter('statusExpiresAt', i) as string;

                const statusData: any = {
                  emoji: statusEmoji,
                  title: statusTitle,
                };

                if (statusExpiresAt) {
                  statusData.expires_at = statusExpiresAt;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'PUT',
                    url: `${credentials?.baseUrl}/profile/status`,
                    body: {
                      status: statusData,
                    },
                  }
                );
                break;
              case 'deleteStatus':
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/profile/status`,
                  }
                );
                break;
            }
            break;

          case 'reactions':
            switch (operation) {
              case 'addReaction':
                const addReactionMessageId = this.getNodeParameter(
                  'reactionsMessageId',
                  i
                ) as number;
                const reactionCode = this.getNodeParameter('reactionsReactionCode', i) as string;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/messages/${addReactionMessageId}/reactions`,
                    body: {
                      code: reactionCode,
                    },
                  }
                );
                break;
              case 'deleteReaction':
                const deleteReactionMessageId = this.getNodeParameter(
                  'reactionsMessageId',
                  i
                ) as number;
                const deleteReactionCode = this.getNodeParameter(
                  'reactionsReactionCode',
                  i
                ) as string;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'DELETE',
                    url: `${credentials?.baseUrl}/messages/${deleteReactionMessageId}/reactions`,
                    body: {
                      code: deleteReactionCode,
                    },
                  }
                );
                break;
              case 'getReactions':
                const getReactionsMessageId = this.getNodeParameter(
                  'reactionsMessageId',
                  i
                ) as number;
                const reactionsPer = this.getNodeParameter('reactionsPer', i) as number;
                const reactionsPage = this.getNodeParameter('reactionsPage', i) as number;

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/messages/${getReactionsMessageId}/reactions`,
                    qs: {
                      per: reactionsPer,
                      page: reactionsPage,
                    },
                  }
                );
                break;
            }
            break;

          case 'thread':
            switch (operation) {
              case 'createThread':
                const createThreadMessageId = this.getNodeParameter('threadMessageId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/messages/${createThreadMessageId}/thread`,
                  }
                );
                break;
              case 'getThread':
                const threadId = this.getNodeParameter('threadThreadId', i) as number;
                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'GET',
                    url: `${credentials?.baseUrl}/threads/${threadId}`,
                  }
                );
                break;
            }
            break;

          case 'form':
            switch (operation) {
              case 'createView':
                const formBuilderMode = this.getNodeParameter('formBuilderMode', i) as string;
                const triggerId = this.getNodeParameter('triggerId', i) as string;
                const privateMetadata = this.getNodeParameter('privateMetadata', i) as string;
                const callbackId = this.getNodeParameter('callbackId', i) as string;

                if (!triggerId) {
                  throw new NodeOperationError(
                    this.getNode(),
                    'Trigger ID is required for creating form view'
                  );
                }

                let viewData: any;

                if (formBuilderMode === 'template') {
                  // Использование готового шаблона
                  const formTemplate = this.getNodeParameter('formTemplate', i) as string;
                  viewData = FORM_TEMPLATES[formTemplate];
                  if (!viewData) {
                    throw new NodeOperationError(
                      this.getNode(),
                      `Form template "${formTemplate}" not found`
                    );
                  }
                } else if (formBuilderMode === 'builder') {
                  // Визуальный конструктор
                  const formTitle = this.getNodeParameter('formTitle', i) as string;
                  const closeText = this.getNodeParameter('closeText', i) as string;
                  const submitText = this.getNodeParameter('submitText', i) as string;
                  const formBlocks = this.getNodeParameter('formBlocks', i) as any;

                  // Преобразуем блоки из визуального конструктора в формат API
                  const blocks: any[] = [];

                  // Обрабатываем formBlocks в разных форматах
                  let blocksToProcess: any[] = [];

                  if (Array.isArray(formBlocks)) {
                    // Если это массив блоков
                    blocksToProcess = formBlocks;
                  } else if (formBlocks && typeof formBlocks === 'object') {
                    // Если это объект с одним блоком {block: {...}}
                    if (formBlocks.block) {
                      blocksToProcess = [formBlocks];
                    }
                  }

                  if (blocksToProcess.length > 0) {
                    for (const blockData of blocksToProcess) {
                      // Пробуем разные способы получения блока
                      const block = blockData.block || blockData;

                      // Если block это массив, проверяем что это - готовые блоки или fixedCollection
                      if (Array.isArray(block)) {
                        // Проверяем первый элемент - если это объект с type, то это готовые блоки
                        if (block.length > 0 && typeof block[0] === 'object' && block[0].type) {
                          // Это массив готовых блоков - обрабатываем каждый блок
                          for (const readyBlock of block) {
                            // Исправляем формат options если нужно
                            if (
                              readyBlock.options &&
                              readyBlock.options.option &&
                              Array.isArray(readyBlock.options.option)
                            ) {
                              readyBlock.options = readyBlock.options.option;
                            }

                            // Исправляем поля selected/checked в options
                            if (readyBlock.options && Array.isArray(readyBlock.options)) {
                              for (const option of readyBlock.options) {
                                // Очищаем опции от лишних полей и приводим к правильному формату
                                const cleanOption: any = {
                                  text: option.text,
                                  value: option.value,
                                };

                                // Добавляем description только если оно есть и отличается от text
                                if (
                                  option.description &&
                                  option.description !== option.text &&
                                  option.description.trim() !== ''
                                ) {
                                  cleanOption.description = option.description;
                                }

                                // Правильно обрабатываем выбранные элементы
                                if (readyBlock.type === 'select') {
                                  // В select используется selected
                                  if (option.selected === true) {
                                    cleanOption.selected = true;
                                  }
                                } else if (readyBlock.type === 'radio') {
                                  // В radio используется checked
                                  if (option.checked === true) {
                                    cleanOption.checked = true;
                                  }
                                } else if (readyBlock.type === 'checkbox') {
                                  // В checkbox используется checked
                                  if (option.checked === true) {
                                    cleanOption.checked = true;
                                  }
                                }

                                // Заменяем опцию на очищенную версию
                                const optionIndex = readyBlock.options.indexOf(option);
                                readyBlock.options[optionIndex] = cleanOption;
                              }
                            }

                            // Убираем пустые поля перед добавлением блока
                            const cleanBlock = { ...readyBlock };
                            if (cleanBlock.hint === '') {
                              delete cleanBlock.hint;
                            }
                            if (cleanBlock.placeholder === '') {
                              delete cleanBlock.placeholder;
                            }
                            if (cleanBlock.initial_value === '') {
                              delete cleanBlock.initial_value;
                            }

                            blocks.push(cleanBlock);
                          }
                          continue; // Переходим к следующему блоку
                        }

                        // В fixedCollection данные приходят как массив значений в порядке полей
                        // Нужно сопоставить с нашими полями в правильном порядке
                        const blockObj: any = {
                          type: block[0] || '', // Block Type
                          text: block[1] || '', // Text Content
                          name: block[2] || '', // Field Name
                          label: block[3] || '', // Field Label
                          required: block[4] || false, // Required
                          hint: block[5] || '', // Hint
                          placeholder: block[6] || '', // Placeholder
                          multiline: block[7] || false, // Multiline
                          initial_value: block[8] || '', // Initial Value
                          min_length: block[9] || 0, // Min Length
                          max_length: block[10] || 3000, // Max Length
                          options: block[11] || [], // Options
                          initial_date: block[12] || '', // Initial Date
                          initial_time: block[13] || '', // Initial Time
                          filetypes: block[14] || '', // File Types
                          max_files: block[15] || 10, // Max Files
                        };

                        // Обрабатываем блок сразу
                        const finalBlockObj: any = {
                          type: blockObj.type,
                        };

                        // Обрабатываем разные типы блоков
                        if (['header', 'plain_text', 'markdown'].includes(blockObj.type)) {
                          finalBlockObj.text = blockObj.text;
                        } else if (blockObj.type === 'divider') {
                          // Разделитель не требует дополнительных параметров
                        } else if (
                          [
                            'input',
                            'select',
                            'radio',
                            'checkbox',
                            'date',
                            'time',
                            'file_input',
                          ].includes(blockObj.type)
                        ) {
                          finalBlockObj.name = blockObj.name;
                          finalBlockObj.label = blockObj.label;
                          if (blockObj.required) finalBlockObj.required = blockObj.required;
                          if (blockObj.hint) finalBlockObj.hint = blockObj.hint;

                          // Специфичные параметры для input
                          if (blockObj.type === 'input') {
                            if (blockObj.placeholder)
                              finalBlockObj.placeholder = blockObj.placeholder;
                            if (blockObj.multiline) finalBlockObj.multiline = blockObj.multiline;
                            if (blockObj.initial_value)
                              finalBlockObj.initial_value = blockObj.initial_value;
                            if (blockObj.min_length) finalBlockObj.min_length = blockObj.min_length;
                            if (blockObj.max_length) finalBlockObj.max_length = blockObj.max_length;
                          }

                          // Параметры для select, radio, checkbox
                          if (
                            ['select', 'radio', 'checkbox'].includes(blockObj.type) &&
                            blockObj.options
                          ) {
                            finalBlockObj.options = blockObj.options.map((opt: any) => {
                              const option: any = {
                                text: opt.option.text,
                                value: opt.option.value,
                              };
                              if (opt.option.description)
                                option.description = opt.option.description;
                              if (blockObj.type === 'select' || blockObj.type === 'radio') {
                                if (opt.option.selected) option.selected = opt.option.selected;
                              } else if (blockObj.type === 'checkbox') {
                                if (opt.option.checked) option.checked = opt.option.checked;
                              }
                              return option;
                            });
                          }

                          // Параметры для date
                          if (blockObj.type === 'date' && blockObj.initial_date) {
                            finalBlockObj.initial_date = blockObj.initial_date;
                          }

                          // Параметры для time
                          if (blockObj.type === 'time' && blockObj.initial_time) {
                            finalBlockObj.initial_time = blockObj.initial_time;
                          }

                          // Параметры для file_input
                          if (blockObj.type === 'file_input') {
                            if (blockObj.filetypes) {
                              finalBlockObj.filetypes = blockObj.filetypes
                                .split(',')
                                .map((t: string) => t.trim());
                            }
                            if (blockObj.max_files) finalBlockObj.max_files = blockObj.max_files;
                          }
                        }

                        blocks.push(finalBlockObj);
                        continue; // Переходим к следующему блоку
                      } else if (block && typeof block === 'object') {
                        // Проверяем, есть ли в объекте готовые блоки

                        // Ищем первый блок с полем type
                        for (const [, value] of Object.entries(block)) {
                          if (value && typeof value === 'object' && (value as any).type) {
                            blocks.push(value);
                            break; // Берем только первый найденный блок
                          }
                        }
                        continue; // Переходим к следующему блоку
                      }

                      if (!block.type) {
                        continue; // Пропускаем блоки без типа
                      }

                      const blockObj: any = {
                        type: block.type,
                      };

                      // Обрабатываем разные типы блоков
                      if (['header', 'plain_text', 'markdown'].includes(block.type)) {
                        blockObj.text = block.text;
                      } else if (block.type === 'divider') {
                        // Разделитель не требует дополнительных параметров
                      } else if (
                        [
                          'input',
                          'select',
                          'radio',
                          'checkbox',
                          'date',
                          'time',
                          'file_input',
                        ].includes(block.type)
                      ) {
                        blockObj.name = block.name;
                        blockObj.label = block.label;
                        if (block.required) blockObj.required = block.required;
                        if (block.hint) blockObj.hint = block.hint;

                        // Специфичные параметры для input
                        if (block.type === 'input') {
                          if (block.placeholder) blockObj.placeholder = block.placeholder;
                          if (block.multiline) blockObj.multiline = block.multiline;
                          if (block.initial_value) blockObj.initial_value = block.initial_value;
                          if (block.min_length) blockObj.min_length = block.min_length;
                          if (block.max_length) blockObj.max_length = block.max_length;
                        }

                        // Параметры для select, radio, checkbox
                        if (['select', 'radio', 'checkbox'].includes(block.type) && block.options) {
                          blockObj.options = block.options.map((opt: any) => {
                            const option: any = {
                              text: opt.option.text,
                              value: opt.option.value,
                            };
                            if (opt.option.description) option.description = opt.option.description;
                            if (block.type === 'select' || block.type === 'radio') {
                              if (opt.option.selected) option.selected = opt.option.selected;
                            } else if (block.type === 'checkbox') {
                              if (opt.option.checked) option.checked = opt.option.checked;
                            }
                            return option;
                          });
                        }

                        // Параметры для date
                        if (block.type === 'date' && block.initial_date) {
                          blockObj.initial_date = block.initial_date;
                        }

                        // Параметры для time
                        if (block.type === 'time' && block.initial_time) {
                          blockObj.initial_time = block.initial_time;
                        }

                        // Параметры для file_input
                        if (block.type === 'file_input') {
                          if (block.filetypes) {
                            blockObj.filetypes = block.filetypes
                              .split(',')
                              .map((t: string) => t.trim());
                          }
                          if (block.max_files) blockObj.max_files = block.max_files;
                        }
                      }

                      blocks.push(blockObj);
                    }
                  }

                  // Валидация: минимум 1 блок
                  if (blocks.length === 0) {
                    if (blocksToProcess.length === 0) {
                      throw new NodeOperationError(
                        this.getNode(),
                        'Form must contain at least one block. Please add blocks using the "Add Block" button in the Form Blocks section.'
                      );
                    } else {
                      throw new NodeOperationError(
                        this.getNode(),
                        'Form must contain at least one block'
                      );
                    }
                  }

                  viewData = {
                    title: formTitle,
                    close_text: closeText,
                    submit_text: submitText,
                    blocks: blocks,
                  };
                } else if (formBuilderMode === 'json') {
                  // JSON редактор
                  const customFormJson = this.getNodeParameter('customFormJson', i) as string;
                  try {
                    viewData = JSON.parse(customFormJson);

                    // Валидация: минимум 1 блок
                    if (
                      !viewData.blocks ||
                      !Array.isArray(viewData.blocks) ||
                      viewData.blocks.length === 0
                    ) {
                      throw new NodeOperationError(
                        this.getNode(),
                        'Form must contain at least one block in blocks array'
                      );
                    }
                  } catch (error) {
                    if (error instanceof NodeOperationError) {
                      throw error;
                    }
                    throw new NodeOperationError(
                      this.getNode(),
                      'Invalid JSON format in Custom Form JSON field'
                    );
                  }
                } else {
                  throw new NodeOperationError(
                    this.getNode(),
                    `Unknown form builder mode: ${formBuilderMode}`
                  );
                }

                const requestBody: any = {
                  trigger_id: triggerId,
                  type: 'modal',
                  view: viewData,
                };

                if (privateMetadata) {
                  requestBody.private_metadata = privateMetadata;
                }
                if (callbackId) {
                  requestBody.callback_id = callbackId;
                }

                responseData = await this.helpers.httpRequestWithAuthentication.call(
                  this,
                  'pachcaApi',
                  {
                    method: 'POST',
                    url: `${credentials?.baseUrl}/views/open`,
                    body: requestBody,
                  }
                );
                break;

              case 'processSubmission':
                // Получаем данные формы из вебхука Pachca
                const webhookData = this.getInputData();
                let formData = webhookData[i]?.json || {};
                const formType = this.getNodeParameter('formType', i) as string;
                const validationErrors = this.getNodeParameter('validationErrors', i) as any;

                // Проверяем режим выполнения
                const executionMode = this.getInputData()[i]?.json?.executionMode;

                // В режиме тестирования пропускаем проверку данных
                if (executionMode === 'test') {
                  // В тестовом режиме создаем тестовые данные
                  if (
                    !formData ||
                    Object.keys(formData).length === 0 ||
                    formData.success === true
                  ) {
                    formData = {
                      text: 'Test form submission',
                      select: 'test_value',
                      checkbox: ['test_option'],
                    };
                  }
                } else {
                  // Проверяем, что это действительно отправка формы
                  if (
                    !formData ||
                    Object.keys(formData).length === 0 ||
                    formData.success === true
                  ) {
                    responseData = {
                      status: 400,
                      message:
                        'No form data received. This operation is for processing form submissions, not button clicks.',
                      receivedData: formData,
                    };
                    break;
                  }
                }

                // Автоматическое определение типа формы по полям
                let detectedFormType = formType;
                if (!formType || formType === 'auto') {
                  // Автоматическое определение типа формы
                  if (!formData || typeof formData !== 'object') {
                    detectedFormType = 'unknown';
                  } else {
                    const fields = Object.keys(formData);

                    if (fields.includes('date_start') && fields.includes('date_end')) {
                      detectedFormType = 'timeoff_request';
                    } else if (fields.includes('rating') && fields.includes('comment')) {
                      detectedFormType = 'feedback_form';
                    } else if (fields.includes('task_title') && fields.includes('priority')) {
                      detectedFormType = 'task_request';
                    } else if (
                      fields.includes('checkbox') ||
                      fields.includes('select') ||
                      fields.includes('text')
                    ) {
                      detectedFormType = 'custom_form';
                    } else {
                      detectedFormType = 'unknown';
                    }
                  }
                }

                // Валидация данных формы
                const errors: any = {};
                if (
                  validationErrors &&
                  typeof validationErrors === 'object' &&
                  Object.keys(validationErrors).length > 0
                ) {
                  Object.assign(errors, validationErrors);
                } else if (
                  validationErrors &&
                  typeof validationErrors === 'string' &&
                  validationErrors !== '{}'
                ) {
                  try {
                    const parsedErrors = JSON.parse(validationErrors);
                    if (typeof parsedErrors === 'object') {
                      Object.assign(errors, parsedErrors);
                    }
                  } catch (e) {}
                }

                // Применяем правила валидации для конкретного типа формы
                if (FORM_VALIDATION_RULES[detectedFormType]) {
                  const rules = FORM_VALIDATION_RULES[detectedFormType];
                  for (const [field, validator] of Object.entries(rules)) {
                    if (formData[field] && typeof validator === 'function') {
                      const error = validator(formData[field], formData);
                      if (error) {
                        errors[field] = error;
                      }
                    }
                  }
                }

                // Если есть ошибки валидации, возвращаем их
                if (Object.keys(errors).length > 0) {
                  // Возвращаем 400 с ошибками для Pachca
                  responseData = {
                    status: 400,
                    errors: errors,
                    formType: detectedFormType,
                  };
                } else {
                  // Успешная обработка - возвращаем 200 для закрытия формы
                  responseData = {
                    status: 200,
                    message: 'Form processed successfully',
                    formType: detectedFormType,
                    processedData: formData,
                  };
                }
                break;

              case 'getTemplates':
                responseData = {
                  templates: Object.keys(FORM_TEMPLATES).map((key) => ({
                    value: key,
                    title: FORM_TEMPLATES[key].title,
                    description: `Preset form template: ${FORM_TEMPLATES[key].title}`,
                  })),
                };
                break;
            }
            break;

          default:
            throw new NodeOperationError(
              this.getNode(),
              `Resource "${resource}" not implemented yet`
            );
        }

        // Для processSubmission возвращаем HTTP ответ для Pachca
        if (resource === 'form' && operation === 'processSubmission') {
          // Возвращаем HTTP ответ для Pachca
          returnData.push({
            json: responseData || {},
            pairedItem: { item: i },
          });
        } else {
          // Для остальных операций возвращаем данные как обычно
          returnData.push({
            json: responseData?.data || responseData || {},
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
              details: String(error),
            },
            pairedItem: { item: i },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}
