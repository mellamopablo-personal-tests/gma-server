define({ "api": [
  {
    "type": "get",
    "url": "/auth/prime",
    "title": "Retrieve the Diffie Hellman prime",
    "name": "GetPrime",
    "group": "Auth",
    "description": "<p>Retrieves the prime needed for the Diffie Hellman key exchange. This is handled by the gma-client-crypto module.</p>",
    "version": "0.0.0",
    "filename": "lib/routes/auth.ts",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/auth/login",
    "title": "Retrieve a session token",
    "name": "Login",
    "group": "Auth",
    "description": "<p>The login method is used to retrieve a session token by sending the user credentials. The session token is then sent as a header in subsequent requests that require authentication. The session token lasts for the amount of time defined in the configuration file, and the duration is refreshed on each authenticated request.</p> <p>Your application should be ready to handle a 401 Unauthorized request, result of the session token expiring, at any time. If that happens, use this method again.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>The users's username.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The users's password.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The token to be used to authenticate on the rest of the api methods.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\ttoken: \"f642ea30f581a78f778bc4010df0bf8e9a177bb7\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "WRONG_USERNAME_OR_PASSWORD",
            "description": "<p>Either the username doesn't exist or the password for the specified users is incorrect.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 401 Unauthorized",
          "content": "HTTP 401 Unauthorized\n{\n\tcode: \"WRONG_USERNAME_OR_PASSWORD\",\n\tmessage: \"The entered username or password are incorrect.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/auth.ts",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/messages",
    "title": "Create a new message",
    "name": "CreateMessage",
    "group": "Messages",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The current session token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "addressee",
            "description": "<p>The addressee's user ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>The message content.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "HTTP 204 No Content",
          "content": "HTTP 204 No Content",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/messages.ts",
    "groupTitle": "Messages"
  },
  {
    "type": "get",
    "url": "/messages/conversations/:userId",
    "title": "Get a conversation",
    "name": "GetConversation",
    "group": "Messages",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The current session token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "userId",
            "description": "<p>The user ID of the second user in the conversation.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Message[]",
            "optional": false,
            "field": "messages",
            "description": "<p>An array containing every message that matches the request. Message is an object containing {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\tmessages: [\n\t\t{\n\t\t\tid: 43,\n\t\t\tfrom: 34,\n\t\t\tto: 68,\n\t\t\tcontent: \"Hello!\"\n\t\t}, {\n\t\t\tid: 44,\n\t\t\tfrom: 34,\n\t\t\tto: 91,\n\t\t\tcontent: \"How are you?\"\n\t\t}\n\t]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/messages.ts",
    "groupTitle": "Messages"
  },
  {
    "type": "get",
    "url": "/messages",
    "title": "Get all messages",
    "name": "GetMessages",
    "group": "Messages",
    "description": "<p>Retrieves all messages: sent by the user, and sent to the user. Therefore, requires authentication.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The current session token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Message[]",
            "optional": false,
            "field": "messages",
            "description": "<p>An array containing every message that matches the request. Message is an object containing {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\tmessages: [\n\t\t{\n\t\t\tid: 43,\n\t\t\tfrom: 34,\n\t\t\tto: 68,\n\t\t\tcontent: \"Hello!\"\n\t\t}, {\n\t\t\tid: 44,\n\t\t\tfrom: 34,\n\t\t\tto: 91,\n\t\t\tcontent: \"How are you?\"\n\t\t}\n\t]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/messages.ts",
    "groupTitle": "Messages"
  },
  {
    "type": "get",
    "url": "/messages/received",
    "title": "Get received messages",
    "name": "GetReceivedMessages",
    "group": "Messages",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The current session token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Message[]",
            "optional": false,
            "field": "messages",
            "description": "<p>An array containing every message that matches the request. Message is an object containing {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\tmessages: [\n\t\t{\n\t\t\tid: 43,\n\t\t\tfrom: 34,\n\t\t\tto: 68,\n\t\t\tcontent: \"Hello!\"\n\t\t}, {\n\t\t\tid: 44,\n\t\t\tfrom: 34,\n\t\t\tto: 91,\n\t\t\tcontent: \"How are you?\"\n\t\t}\n\t]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/messages.ts",
    "groupTitle": "Messages"
  },
  {
    "type": "get",
    "url": "/messages/sent",
    "title": "Get sent messages",
    "name": "GetSentMessages",
    "group": "Messages",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The current session token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Message[]",
            "optional": false,
            "field": "messages",
            "description": "<p>An array containing every message that matches the request. Message is an object containing {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\tmessages: [\n\t\t{\n\t\t\tid: 43,\n\t\t\tfrom: 34,\n\t\t\tto: 68,\n\t\t\tcontent: \"Hello!\"\n\t\t}, {\n\t\t\tid: 44,\n\t\t\tfrom: 34,\n\t\t\tto: 91,\n\t\t\tcontent: \"How are you?\"\n\t\t}\n\t]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/messages.ts",
    "groupTitle": "Messages"
  },
  {
    "type": "post",
    "url": "/users",
    "title": "Create a new user",
    "name": "CreateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>The users's username, which will be used to authenticate.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The users's password, which will be used to authenticate.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "publicKey",
            "description": "<p>The user's Diffie Hellman public key. The module gma-client-crypto takes care of that.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the created users.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 201 Created",
          "content": "HTTP 201 Created\n{\n\tid: 37\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "422": [
          {
            "group": "422",
            "optional": false,
            "field": "NAME_ALREADY_TAKEN",
            "description": "<p>The username is already in use.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 422 Unprocessable Entity",
          "content": "HTTP 422 Unprocessable Entity\n{\n\tcode: \"NAME_ALREADY_TAKEN\",\n\tmessage: \"The specified username <my_username> is already taken.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/users.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Retrieve a list of all users",
    "name": "GetUsers",
    "group": "User",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "User[]",
            "optional": false,
            "field": "users",
            "description": "<p>An array containing every user. Each user will contain the following properties: id, and name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP 200 OK",
          "content": "HTTP 200 OK\n{\n\tusers: [\n\t\t{\n\t\t\tid: 1,\n\t\t\tname: \"firstUser\"\n\t\t}, {\n\t\t\tid: 2\n\t\t\tname: \"secondUser\"\n\t\t}\n\t]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/users.ts",
    "groupTitle": "User"
  }
] });
