# Request & Response

The Request and Response objects are the core of HTTP communication in BlitzBun. They provide APIs for accessing request data, managing headers, handling cookies, and generating responses.

## Request Object

The Request object contains all information about the incoming HTTP request.

### Basic Request Information

The request object provides access to:

- **HTTP Method**: The request method (GET, POST, PUT, DELETE, etc.)
- **Request Path**: The URL path being requested
- **Request ID**: A unique identifier for the request
- **Client Information**: IP address and user agent details
- **Full URL**: Complete request URL with query parameters

### Accessing Parameters

BlitzBun provides methods to access different types of request data:

- **Route Parameters**: Values from URL segments (like `/users/:id`)
- **Query Parameters**: Values from URL query string (`?page=1&limit=10`)
- **Request Body**: JSON or form data sent in POST/PUT requests
- **Combined Access**: Unified access across all parameter sources

### Request Body Handling

The framework handles various content types:

- **JSON Data**: Automatic parsing of JSON request bodies
- **Form Data**: Support for URL-encoded and multipart form data
- **Type Safety**: TypeScript support for typed request bodies
- **Field Access**: Methods to check for and retrieve specific fields

### Headers and Cookies

Request header and cookie management:

- **Header Access**: Read request headers with fallback values
- **Authorization**: Built-in support for Bearer tokens and API keys
- **Cookie Handling**: Read and validate request cookies
- **Security Headers**: Access to security-related headers

### Content Type Detection

BlitzBun provides methods to detect different request types:

- **JSON Requests**: Identify JSON API requests
- **AJAX Requests**: Detect AJAX/XHR requests
- **Form Submissions**: Handle form-based submissions
- **File Uploads**: Process multipart form data with files

### User and Session Data

For authenticated requests:

- **User Data**: Access authenticated user information
- **Session Management**: Read and write session data
- **Request Context**: Custom data attached to requests
- **Authorization**: Permission and role checking

### Request Validation

The validation system shown in your example:

```typescript
profile = async (req: HttpRequestContract, res: HttpResponseContract) => {
  const validator = req.getValidator('profile');

  if (await validator.fails()) {
    return res.status(400).json({
      success: false,
      errors: validator.getErrors(),
    });
  }

  return res.status(200).json({
    success: true,
  });
};
```

## Response Object

The Response object provides methods for generating various types of HTTP responses, managing headers, and handling cookies.

### Basic Responses

BlitzBun supports different response formats:

- **JSON Responses**: Structured data responses for APIs
- **HTML Responses**: Server-rendered HTML content
- **Text Responses**: Plain text responses
- **File Responses**: Serving static files and downloads
- **Stream Responses**: For large files or real-time data

### Status Codes

HTTP status code management:

- **Success Codes**: 200 OK, 201 Created, 204 No Content
- **Client Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found
- **Server Error Codes**: 500 Internal Server Error, 503 Service Unavailable
- **Redirect Codes**: 301 Permanent, 302 Temporary redirects

### Headers Management

Response header control:

- **Content Headers**: Content-Type, Content-Length, Content-Encoding
- **Security Headers**: CORS, CSP, security-related headers  
- **Caching Headers**: Cache-Control, ETag, Last-Modified
- **Custom Headers**: Application-specific header management

### Cookie Management

Server-side cookie operations:

- **Setting Cookies**: Create cookies with various options
- **Security Options**: HttpOnly, Secure, SameSite settings
- **Cookie Expiration**: Max-Age and Expires configuration
- **Clearing Cookies**: Remove cookies from client

### File Responses

File serving capabilities:

- **Static Files**: Serve files directly from filesystem
- **Downloads**: Force file downloads with proper headers
- **Streaming**: Efficient streaming for large files
- **Content Negotiation**: Handle different file formats

### Redirects

URL redirection features:

- **Permanent Redirects**: 301 redirects for SEO
- **Temporary Redirects**: 302 redirects for form submissions
- **External Redirects**: Redirect to external domains
- **Conditional Redirects**: Logic-based redirections

### Template Rendering

Server-side rendering support:

- **Template Engines**: Integration with various template systems
- **Data Binding**: Pass data to templates
- **Layout Systems**: Master layouts and partial templates
- **Caching**: Template compilation and caching

### Response Chaining

Method chaining for cleaner code:

- **Fluent Interface**: Chain multiple response operations
- **Status and Headers**: Set status codes and headers together
- **Cookie and Response**: Set cookies and send response data
- **Error Handling**: Consistent error response patterns

### Error Responses

Standardized error handling:

- **Error Formats**: Consistent error response structures
- **Status Codes**: Appropriate HTTP status for different errors
- **Error Details**: Detailed error information for debugging
- **User-Friendly Messages**: Client-appropriate error messages

## Best Practices

1. **Input Validation**: Always validate request data before processing
2. **Error Handling**: Provide consistent error response formats
3. **Security Headers**: Set appropriate security-related headers
4. **Status Codes**: Use proper HTTP status codes for different scenarios
5. **Content Types**: Set correct Content-Type headers for responses
6. **Caching**: Implement appropriate caching strategies
7. **Rate Limiting**: Protect against abuse with rate limiting
8. **Logging**: Log important requests and responses for debugging

## Next Steps

- [Controllers](./controllers.md) - Organize request/response logic in controllers
- [Middleware](./middleware.md) - Process requests before they reach your handlers
- [Validation](./validation.md) - Comprehensive input validation system
- [Routing](./routing.md) - Define routes that use request/response objects