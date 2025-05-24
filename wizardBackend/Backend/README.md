# XML Parser Service Documentation

## Overview

The XML Parser Service is a specialized Node.js backend service designed to process XML files and extract product information. This service is particularly useful for handling product catalogs, inventory data, or any XML-structured product information.

## Features

- Streaming XML parsing for efficient memory usage
- Support for multiple product tag variations
- CORS-enabled for secure frontend integration
- Detailed error reporting
- Formatted XML output
- Real-time parsing status

## Technical Requirements

- Node.js (v12 or higher recommended)
- NPM (Node Package Manager)

## Dependencies

```json
{
  "express": "^4.x.x",
  "sax": "^1.x.x",
  "cors": "^2.x.x"
}
```

## Installation

1. Navigate to the project directory:
   ```bash
   cd wizardBackend/Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Server Configuration

- Default Port: 3001 (configurable via PORT environment variable)
- CORS Origin: http://localhost:5173 (frontend development server)
- Allowed HTTP Methods: GET, POST, OPTIONS
- Allowed Headers: Content-Type, Authorization, X-Requested-With, Accept

### Product Tag Support

The service recognizes the following XML tags as product identifiers:

- `<item>`
- `<product>`
- `<Article>`
- `<Product>`
- `<Item>`

## API Documentation

### GET /

Main endpoint for XML parsing

#### Success Response

```json
{
  "success": true,
  "parsed": "<XML string of first product>"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "supportedTags": ["item", "product", "Article", "Product", "Item"]
}
```

## XML Parsing Process

The service implements a streaming XML parser using the following process:

1. **File Reading**

   - Creates a read stream from the XML file
   - Processes data in chunks for memory efficiency

2. **Tag Detection**

   - Identifies product tags from the supported list
   - Tracks XML document depth
   - Maintains parsing context

3. **Content Extraction**

   - Captures the first complete product entry
   - Preserves XML structure and formatting
   - Handles nested elements

4. **Output Formatting**
   - Maintains proper indentation
   - Preserves tag hierarchy
   - Ensures valid XML structure

## Error Handling

The service implements comprehensive error handling for:

- File access issues
- XML parsing errors
- Missing product entries
- Malformed XML structure
- Network-related issues

## Usage Example

```javascript
// Example API call using fetch
fetch("http://localhost:3001/")
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      console.log("Parsed XML:", data.parsed);
    } else {
      console.error("Error:", data.error);
    }
  });
```

## Implementation Details

### XMLStreamer.js

The main service file implements:

- SAX parser configuration
- Stream processing logic
- Event handlers for XML parsing
- Error management
- Response formatting

### Key Components

#### Parser Events

1. **opentag**

   - Detects product tags
   - Initiates capture process
   - Manages parsing depth

2. **text**

   - Captures element content
   - Handles text normalization
   - Preserves data integrity

3. **closetag**
   - Completes element processing
   - Maintains structure integrity
   - Finalizes product capture

## Best Practices

1. **Memory Management**

   - Uses streaming for large files
   - Processes only necessary data
   - Cleans up resources properly

2. **Error Handling**

   - Provides detailed error messages
   - Implements proper error propagation
   - Maintains service stability

3. **Security**
   - Implements CORS protection
   - Validates input data
   - Sanitizes output

## Limitations

1. Only processes the first product entry
2. Fixed XML file path
3. Specific CORS origin
4. Limited tag support

## Future Enhancements

Potential improvements could include:

1. Configurable file paths
2. Multiple product processing
3. Custom tag support
4. Advanced filtering options
5. XML validation
6. Output format options

## Troubleshooting

Common issues and solutions:

1. **CORS Errors**

   - Verify frontend origin
   - Check allowed methods
   - Validate headers

2. **Parsing Failures**

   - Validate XML structure
   - Check file permissions
   - Verify product tags

3. **No Products Found**
   - Confirm XML structure
   - Verify supported tags
   - Check file content

## Support

For issues or questions:

1. Check error messages in console
2. Verify XML file structure
3. Confirm server configuration
4. Review CORS settings

## Contributing

Guidelines for contributing:

1. Follow existing code style
2. Add appropriate documentation
3. Include error handling
4. Test thoroughly
