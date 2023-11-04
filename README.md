# Book list

# Functionality of the application

This application will allow creating/removing/updating/fetching a books from a list. Each book entry can optionally have an attachment image. Each user only has access to the book list that he/she has created.

# Book list

The application should store a book list, and each list contains the following fields:

* `bookId` (string) - a unique id for a book
* `createdAt` (string) - date and time when an item was created
* `title` (string) - name of a TODO item (e.g. "Change a light bulb")
* `readDate` (string) - date and time by which an item should be completed
* `isRead` (boolean) - true if a book was read, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item
* `userId` (string) - a unique id for the owner of the book list

# Frontend

The `client` folder contains a web application that can use the API expose by the backend serverless project.

## Authentication

With Auth0 JWT tokens.

## DB storage

With dynamodb

## File storage

With a ss3 bucket which has cors enable so storing files is done thru signed URLs

## Logging

Is been done with [Winston](https://github.com/winstonjs/winston)

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

```
cd client
npm install
npm run start
```

# Postman collection

Within this project there is a postman collection ready to be consume APIs expose by book serverless application.