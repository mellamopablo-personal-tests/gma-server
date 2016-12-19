define({ "api": [
  {
    "type": "post",
    "url": "/login",
    "title": "Log in and get a session token",
    "name": "Login",
    "group": "Login",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>The user's username.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The user's password.</p>"
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
            "description": "<p>Either the username doesn't exist or the password for the specified user is incorrect.</p>"
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
    "filename": "lib/routes/login.ts",
    "groupTitle": "Login"
  },
  {
    "type": "post",
    "url": "/user",
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
            "description": "<p>The user's username, which will be used to authenticate.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The user's password, which will be used to authenticate.</p>"
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
            "description": "<p>The id of the created user.</p>"
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
          "content": "HTTP 422 Unprocessable Entity\n{\n\tcode: \"NAME_ALREADY_TAKEN\",\n\tmessage:\"The specified username myUsername is already taken.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/routes/user.ts",
    "groupTitle": "User"
  }
] });
