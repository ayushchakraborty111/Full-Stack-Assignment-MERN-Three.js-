# Full-Stack MERN 3D Model Viewer - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [API Documentation](#api-documentation)
6. [Dependencies & Packages](#dependencies--packages)
7. [Installation & Setup](#installation--setup)
8. [Use Cases](#use-cases)
9. [Error Handling](#error-handling)
10. [State Management](#state-management)

---

## Project Overview

**Full-Stack MERN 3D Model Viewer** is a web application that enables users to upload, view, and customize 3D models (GLB/GLTF formats) with real-time material and environment presets. The application features an interactive 3D viewer with customizable shading, HDRI environments, and persistent settings storage.

**Tech Stack:**
- **Frontend:** React 19, Redux Toolkit, React Three Fiber, Three.js, Vite
- **Backend:** Node.js, Express.js 5.2.1, MongoDB (Mongoose)
- **File Storage:** Cloudinary (with Multer)
- **Build Tool:** Vite

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Frontend (Vite + Redux)                │  │
│  │  - Upload Section (File Input + Loader)             │  │
│  │  - 3D Model Viewer (React Three Fiber)              │  │
│  │  - Settings Panel (Real-time Controls)              │  │
│  │  - Redux Store (Media & Settings State)             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────────┘
                 │ HTTP/JSON
┌────────────────▼───────────────────────────────────────────┐
│          Express.js Backend (Node.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Routes & Controllers (MVC)                 │  │
│  │  - /media    (uploadModel, deleteModel, getLatest)  │  │
│  │  - /settings (saveSettings, getSettings)            │  │
│  │  - Error Handler & Validators                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Models (Mongoose)                  │  │
│  │  - Media Schema (media_url, file_type, timestamps)  │  │
│  │  - Settings Schema (colors, materials, HDRI)        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Middleware                                 │  │
│  │  - Error Handler (Global Exception Management)      │  │
│  │  - Multer (File Upload Processing)                  │  │
│  │  - CORS (Cross-Origin Request Handling)             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────────┘
                 │ MongoDB Protocol
┌────────────────▼───────────────────────────────────────────┐
│            MongoDB Database                                 │
│  - Media Collection (3D model metadata)                     │
│  - Settings Collection (viewer configurations)              │
└─────────────────────────────────────────────────────────────┘

                 │ REST API
┌────────────────▼───────────────────────────────────────────┐
│      Cloudinary CDN (File Storage & Distribution)          │
│      - Hosts uploaded GLB/GLTF files                       │
│      - Provides optimized URLs                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### MVC Pattern Implementation

#### **Models** (Data Layer)

##### Media Model
```
Location: backend/models/media.js

Schema Structure:
{
  _id: ObjectId (auto-generated)
  media_url: String (required) - URL to the 3D model file
  file_type: String (enum: ['glb', 'gltf'], required)
  original_name: String - Original filename
  createdAt: Timestamp (auto-generated)
  updatedAt: Timestamp (auto-generated)
}

Relationships:
- One-to-Many: One Media can have multiple Settings
```

##### Settings Model
```
Location: backend/models/settings.js

Schema Structure:
{
  _id: ObjectId (auto-generated)
  media_id: ObjectId (ref: 'Media', required) - Foreign key to Media
  backgroundColor: String (required) - Hex color value
  wireframe_mode: Boolean (default: false)
  material_type: String (default: 'standard', enum: ['standard', 'metallic', 'plastic', 'leather'])
  hdri_preset: String (default: 'sunset', enum: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city'])
  createdAt: Timestamp (auto-generated)
  updatedAt: Timestamp (auto-generated)
}

Relationships:
- Many-to-One: Many Settings belong to One Media
- Foreign Key: media_id links to Media collection
```

#### **Controllers** (Business Logic Layer)

##### mediaController.js
```
Location: backend/controllers/mediaController.js

Functions:

1. uploadModel(req, res, next)
   - Purpose: Handle file upload to Cloudinary via Multer
   - Input: Multipart form data with 'model' file field
   - Processes:
     * Validates file existence
     * Validates file type (glb/gltf only)
     * Creates Media document in MongoDB
   - Output: {
       success: boolean,
       message: string,
       file_url: string,
       media_id: ObjectId,
       data: Media document
     }
   - Error Handling: Uses catchAsyncErrors wrapper + AppError class
   - Status: 201 (Created) or 400/500 (Error)

2. deleteModel(req, res, next)
   - Purpose: Delete media file and associated settings
   - Input: mediaId from URL params
   - Processes:
     * Validates mediaId existence
     * Retrieves media from DB
     * Deletes physical file from Cloudinary storage
     * Cascades deletion to associated Settings
   - Output: { success: boolean, message: string }
   - Transaction: Uses Promise.all for atomic operations
   - Status: 200 (OK) or 404/400 (Error)

3. getLatestMedia(req, res, next)
   - Purpose: Retrieve the most recently uploaded media
   - Sorting: By createdAt descending
   - Output: {
       success: boolean,
       data: Media document
     }
   - Status: 200 (OK) or 404 (Not Found)
```

##### settingController.js
```
Location: backend/controllers/settingController.js

Functions:

1. saveSettings(req, res, next)
   - Purpose: Create or update viewer settings for a media
   - Input: {
       media_id: ObjectId,
       backgroundColor: string,
       wireframe_mode: boolean,
       material_type: string,
       hdri_preset: string
     }
   - Processes:
     * Validates required fields (media_id, backgroundColor)
     * Uses MongoDB upsert for create/update logic
     * Triggers validators on update
   - Output: {
       success: boolean,
       message: string,
       data: Settings document
     }
   - Status: 201 (Created) or 400/500 (Error)

2. getSettings(req, res, next)
   - Purpose: Retrieve settings for a specific media
   - Input: mediaId from URL params
   - Processes:
     * Validates mediaId
     * Retrieves all settings for media
     * Populates media reference
     * Sorts by most recent update
   - Output: {
       success: boolean,
       count: number,
       data: [Settings documents]
     }
   - Status: 200 (OK) or 404 (Not Found)
```

#### **Routes** (API Endpoints Layer)

##### mediaRoutes.js
```
Location: backend/routes/mediaRoutes.js

Routes:
1. POST /upload
   - Handler: uploadModel
   - Middleware: upload.single('model') [Multer]
   - Description: Upload 3D model file

2. DELETE /:mediaId
   - Handler: deleteModel
   - Description: Delete media and related settings

3. GET /latest
   - Handler: getLatestMedia
   - Description: Get most recently uploaded media
```

##### settingRoutes.js
```
Location: backend/routes/settingRoutes.js

Routes:
1. POST /
   - Handler: saveSettings
   - Body: { media_id, backgroundColor, wireframe_mode, material_type, hdri_preset }
   - Description: Save viewer settings

2. GET /:mediaId
   - Handler: getSettings
   - Description: Get all settings for a media
```

#### **Middleware** (Cross-cutting Concerns)

##### errorHandler.js
```
Location: backend/middleware/errorHandler.js

Components:

1. AppError Class (Custom Exception)
   - Extends: Error
   - Constructor: (message, statusCode)
   - Used for consistent error throwing
   - Example: new AppError("File not found", 404)

2. errorHandler Middleware (Global Error Handler)
   - Catches all errors from downstream middleware/routes
   - Handles specific error types:
     * ValidationError (Mongoose validation)
     * Duplicate key error (MongoDB constraint)
     * JWT errors (Token validation)
     * MulterError (File upload errors)
   - Returns standardized JSON response:
     {
       success: false,
       statusCode: number,
       message: string,
       stack: string (development only)
     }

3. catchAsyncErrors Wrapper
   - Wraps async route handlers
   - Automatically catches unhandled promise rejections
   - Format: catchAsyncErrors((req, res, next) => {...})
   - Prevents need for try-catch in every controller
```

---

## Frontend Architecture

### Component Structure

#### **Components** (UI Layer)

##### UploadSection.jsx
```
Location: frontend/src/components/UploadSection.jsx

Purpose: Handle 3D model file uploads with real-time feedback

State Management:
- Redux selector: state.media
  * mediaId: ObjectId
  * modelUrl: string
  * isLoading: boolean
  * isDeleting: boolean
  * error: string | null

UI Elements:
1. File Input
   - Accepts: .glb, .gltf files
   - Disabled during upload/delete operations
   - Triggers: uploadModel async thunk

2. Loading Spinner
   - Displayed: During file upload
   - Animation: CSS rotating spinner
   - Text: "Uploading model..."

3. Error Display
   - Displayed when: isLoading === false && error !== null
   - Background: Light red (#ffebee)
   - Shows: Error message from server

4. Delete Button
   - Displayed when: modelUrl exists && !isLoading
   - Disabled during deletion
   - Opacity: Reduces to 0.6 when disabled
   - Triggers: deleteModel async thunk

Event Handlers:
- handleUpload: Dispatch uploadModel with file
- handleDelete: Dispatch deleteModel with mediaId
```

##### SettingsPanel.jsx
```
Location: frontend/src/components/SettingsPanel.jsx

Purpose: Provide real-time viewer customization controls

State Management:
- Redux selector: state.settings
  * backgroundColor: string (hex color)
  * wireframe_mode: boolean
  * material_type: string
  * hdri_preset: string
  * isSaving: boolean
  * error: string | null

UI Controls:

1. Background Color Picker
   - Type: <input type="color" />
   - Triggers: setLocalSettings (immediate)
   - Values updated in real-time in 3D viewer

2. Wireframe Mode Toggle
   - Type: <input type="checkbox" />
   - Triggers: setLocalSettings (immediate)
   - Switches between solid and wireframe rendering

3. Material Type Selector
   - Type: <select>
   - Options: ['standard', 'metallic', 'plastic', 'leather']
   - Default: 'standard'
   - Triggers: setLocalSettings (immediate)

4. HDRI Environment Selector
   - Type: <select>
   - Options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city']
   - Default: 'sunset'
   - Triggers: setLocalSettings (immediate)

5. Save Settings Button
   - Behavior:
     * Shows inline spinner during saving
     * Disabled (opacity 0.6) during API call
     * Text changes to "Saving..."
   - Triggers: saveSettings async thunk
   - Sends: { media_id, backgroundColor, wireframe_mode, material_type, hdri_preset }

6. Error Display
   - Same styling as UploadSection
   - Shows server validation errors
```

##### ModelViewer.jsx
```
Location: frontend/src/components/ModelViewer.jsx

Purpose: 3D model rendering and interaction (Expected to be present)

Technologies:
- React Three Fiber: WebGL rendering wrapper
- Three.js: 3D graphics engine
- @react-three/drei: Utilities for R3F

Features (Inferred from Settings):
- Model loading from URL
- Material system (standard, metallic, plastic, leather)
- HDRI environment mapping
- Wireframe mode toggle
- Custom background color
- Interactive controls (rotation, zoom, pan)
```

### Redux State Management

#### **Media Slice** (mediaSlice.js)
```
Location: frontend/src/slice/mediaSlice.js

State Structure:
{
  media: {
    modelUrl: string | null,
    mediaId: ObjectId | null,
    isLoading: boolean,
    isDeleting: boolean,
    error: string | null
  }
}

Async Thunks:

1. uploadModel (async)
   - Action: POST /media/upload
   - Input: File object
   - Process:
     * Creates FormData with file
     * Sends multipart request
   - Pending: Sets isLoading = true, error = null
   - Fulfilled: Updates modelUrl, mediaId from response
   - Rejected: Sets error, clears loading
   - API Response: { file_url, media_id, data }

2. deleteModel (async)
   - Action: DELETE /media/:mediaId
   - Input: mediaId string
   - Pending: Sets isDeleting = true, error = null
   - Fulfilled: Clears modelUrl, mediaId
   - Rejected: Sets error, clears deleting
   - API Response: { success, message }

3. fetchLatestMedia (async)
   - Action: GET /media/latest
   - Abort condition: If modelUrl already exists
   - Pending: Sets isLoading = true, error = null
   - Fulfilled: Updates modelUrl, mediaId
   - Rejected: Sets error
   - API Response: Media document

Synchronous Actions:

1. clearMedia: Resets modelUrl and mediaId to null
```

#### **Settings Slice** (settingSlice.js)
```
Location: frontend/src/slice/settingSlice.js

State Structure:
{
  settings: {
    backgroundColor: string,      // hex color, default: "#ffffff"
    wireframe_mode: boolean,       // default: false
    material_type: string,         // default: "standard"
    hdri_preset: string,          // default: "sunset"
    isLoading: boolean,
    isSaving: boolean,
    error: string | null
  }
}

Async Thunks:

1. saveSettings (async)
   - Action: POST /settings
   - Input: { media_id, backgroundColor, wireframe_mode, material_type, hdri_preset }
   - Pending: Sets isSaving = true, error = null
   - Fulfilled: Updates state from response.data
   - Rejected: Sets error message
   - API Response: { success, message, data: Settings document }

2. fetchSettings (async)
   - Action: GET /settings/:mediaId
   - Input: mediaId string
   - Pending: Sets isLoading = true, error = null
   - Fulfilled: 
     * If data found: Updates all settings fields
     * If no data: Resets to defaults
   - Rejected: Sets error message
   - API Response: [Settings documents]

Synchronous Actions:

1. setLocalSettings (reducer)
   - Updates state immediately (no API call)
   - Input: { backgroundColor, wireframe_mode, material_type, hdri_preset }
   - Used for real-time preview before saving

2. clearSettings (reducer)
   - Resets all settings to default values
```

#### **Store Configuration** (store.js)
```
Location: frontend/src/createStore/store.js

Setup:
- configureStore from @reduxjs/toolkit
- Combines: mediaSlice reducer + settingsSlice reducer
- Middleware: Default thunk middleware for async actions
- DevTools: Enabled in development
```

---

## API Documentation

### Base URL
```
http://localhost:5000/
```

### Media Endpoints

#### 1. Upload 3D Model
```
POST /media/upload

Content-Type: multipart/form-data

Request:
  File field: 'model' (required)
  Accepted types: .glb, .gltf
  Max size: As configured in Multer

Success Response (201):
{
  "success": true,
  "message": "File uploaded successfully",
  "file_url": "https://cloudinary.com/...",
  "media_id": "507f1f77bcf86cd799439011",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "media_url": "https://cloudinary.com/...",
    "file_type": "glb",
    "original_name": "model.glb",
    "createdAt": "2024-02-19T10:30:00Z",
    "updatedAt": "2024-02-19T10:30:00Z"
  }
}

Error Response (400/500):
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: glb, gltf"
}
```

#### 2. Delete Media
```
DELETE /media/:mediaId

Path Parameters:
  mediaId: MongoDB ObjectId (required)

Success Response (200):
{
  "success": true,
  "message": "Media deleted successfully"
}

Error Response (404/400):
{
  "success": false,
  "statusCode": 404,
  "message": "Media not found"
}

Side Effects:
  - Deletes file from Cloudinary storage
  - Deletes associated Settings documents (cascade)
```

#### 3. Get Latest Media
```
GET /media/latest

Success Response (200):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "media_url": "https://cloudinary.com/...",
    "file_type": "glb",
    "original_name": "model.glb",
    "createdAt": "2024-02-19T10:30:00Z",
    "updatedAt": "2024-02-19T10:30:00Z"
  }
}

Error Response (404):
{
  "success": false,
  "statusCode": 404,
  "message": "No media found"
}
```

### Settings Endpoints

#### 1. Save Settings
```
POST /settings

Content-Type: application/json

Request Body:
{
  "media_id": "507f1f77bcf86cd799439011" (required),
  "backgroundColor": "#ffffff" (required),
  "wireframe_mode": false (optional, default: false),
  "material_type": "standard" (optional, default: "standard"),
  "hdri_preset": "sunset" (optional, default: "sunset")
}

Validation:
  - media_id: Must be valid ObjectId
  - backgroundColor: Must be valid hex color
  - wireframe_mode: Boolean
  - material_type: One of [standard, metallic, plastic, leather]
  - hdri_preset: One of [sunset, dawn, night, warehouse, forest, apartment, studio, city]

Success Response (201):
{
  "success": true,
  "message": "Viewer settings saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "media_id": "507f1f77bcf86cd799439011",
    "backgroundColor": "#ffffff",
    "wireframe_mode": false,
    "material_type": "standard",
    "hdri_preset": "sunset",
    "createdAt": "2024-02-19T10:35:00Z",
    "updatedAt": "2024-02-19T10:35:00Z"
  }
}

Error Response (400/500):
{
  "success": false,
  "statusCode": 400,
  "message": "Background color is required"
}

Behavior:
  - If settings for media_id don't exist: Creates new
  - If settings exist: Updates existing (upsert)
```

#### 2. Get Settings
```
GET /settings/:mediaId

Path Parameters:
  mediaId: MongoDB ObjectId (required)

Success Response (200):
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "media_id": {
        "_id": "507f1f77bcf86cd799439011",
        "media_url": "...",
        "file_type": "glb",
        ...
      },
      "backgroundColor": "#ffffff",
      "wireframe_mode": false,
      "material_type": "standard",
      "hdri_preset": "sunset",
      "createdAt": "2024-02-19T10:35:00Z",
      "updatedAt": "2024-02-19T10:35:00Z"
    }
  ]
}

Error Response (404/400):
{
  "success": false,
  "statusCode": 404,
  "message": "No settings found for this media"
}

Note: Returns array, sorted by most recent update
```

---

## Dependencies & Packages

### Backend Dependencies

```json
{
  "cloudinary": "^1.41.3",
    → Purpose: CDN for file storage and distribution
    → Features: Direct upload API, optimization, delivery
    → Usage: Integrated with Multer for upload handling

  "cors": "^2.8.6",
    → Purpose: Cross-Origin Resource Sharing middleware
    → Features: Enables frontend to make requests from different origin
    → Configuration: Allows all origins (configurable in production)

  "dotenv": "^17.3.1",
    → Purpose: Environment variable management
    → Features: Loads .env file at application start
    → Variables: PORT, DB_URI, Cloudinary credentials

  "express": "^5.2.1",
    → Purpose: Web application framework
    → Features: HTTP server, routing, middleware stack
    → Used for: REST API endpoints, request handling

  "mongoose": "^9.2.1",
    → Purpose: MongoDB ODM (Object Data Modeling)
    → Features: Schema validation, query builders, relationships
    → Used for: Media and Settings models

  "multer": "^2.0.2",
    → Purpose: Multipart form data handling
    → Features: File upload processing, validation
    → Integration: With Cloudinary via multer-storage-cloudinary

  "multer-storage-cloudinary": "^4.0.0",
    → Purpose: Multer storage engine for Cloudinary
    → Features: Direct upload to Cloudinary instead of local storage
    → Configuration: Requires Cloudinary API credentials

  "nodemon": "^3.1.11" (Dev)
    → Purpose: Development server auto-restart
    → Features: Watches file changes and restarts server
    → Usage: npm run dev
}
```

### Frontend Dependencies

```json
{
  "@react-three/drei": "^10.7.7",
    → Purpose: Useful helpers for React Three Fiber
    → Features: OrbitControls, models loading, effects
    → Usage: Camera controls, model transformations

  "@react-three/fiber": "^9.5.0",
    → Purpose: React renderer for Three.js
    → Features: Declarative 3D rendering, hooks, components
    → Usage: Creating 3D scenes with React syntax

  "@reduxjs/toolkit": "^2.11.2",
    → Purpose: State management library
    → Features: createSlice, createAsyncThunk, configureStore
    → Usage: Media & Settings state management

  "axios": "^1.13.5",
    → Purpose: HTTP client library
    → Features: Promise-based, interceptors, cancel tokens
    → Usage: API calls from Redux thunks

  "react": "^19.2.0",
    → Purpose: UI library for React applications
    → Features: Hooks, components, JSX

  "react-dom": "^19.2.0",
    → Purpose: React rendering to DOM
    → Features: createRoot, rendering components

  "react-redux": "^9.2.0",
    → Purpose: Redux bindings for React
    → Features: useSelector, useDispatch hooks
    → Usage: Connect components to Redux store

  "three": "^0.183.0",
    → Purpose: 3D graphics JavaScript library
    → Features: WebGL rendering, geometries, materials, lighting
    → Usage: Underlying 3D engine for @react-three/fiber
}
```

### Dev Dependencies

**Frontend:**
- vite: ^7.3.1 - Build tool and dev server
- @vitejs/plugin-react: ^5.1.1 - React plugin for Vite
- eslint: ^9.39.1 - Code quality linting
- @types/react, @types/react-dom - TypeScript definitions

---

## Installation & Setup

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account for file storage

### 1. Clone Repository
```bash
cd Full-Stack-Assignment-MERN-Three.js
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
EOF

# Start development server (with auto-reload)
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_BACKEND_URL=http://localhost:5000
EOF

# Start development server
npm run dev
# Application will run on http://localhost:5173
```

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Connection string in .env:
MONGODB_URI=mongodb://localhost:27017/mern-3d-viewer
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Add IP address to whitelist
4. Create database user
5. Copy connection string
6. Add to .env as MONGODB_URI
```

### 5. Cloudinary Setup

```
1. Sign up at https://cloudinary.com
2. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add to .env file
4. Configure upload preset (optional, for more control)
```

---

## Use Cases

### Use Case 1: Upload and View 3D Model

**Actor:** User

**Preconditions:**
- Application is running (frontend & backend)
- User has a GLB/GLTF file ready

**Steps:**
1. User opens application in browser
2. Navigates to Upload Section
3. Clicks file input and selects 3D model file
4. Loader appears: "Uploading model..."
5. File is multipart-uploaded to backend
6. Backend validates file type
7. File is uploaded to Cloudinary
8. Media document created in MongoDB with file URL
9. Frontend receives mediaId and modelUrl in response
10. Redux mediaSlice updates with new model data
11. ModelViewer component receives the URL and renders 3D model
12. Delete button appears once upload completes

**Success Criteria:**
- Model displays in 3D viewer
- No errors shown
- Delete option available
- Loader disappears

**Error Handling:**
- Invalid file type → Error message: "Invalid file type. Only GLB/GLTF allowed"
- File too large → Multer error handling
- Network failure → Axios rejection, error message displayed

---

### Use Case 2: Customize Viewer Settings in Real-Time

**Actor:** User

**Preconditions:**
- 3D model is loaded in viewer
- Settings Panel is visible

**Steps:**
1. User opens Settings Panel
2. **Background Color Adjustment:**
   - Clicks color picker
   - Selects new color
   - Redux updates local state (setLocalSettings)
   - ModelViewer reacts to color change immediately
3. **Toggle Wireframe Mode:**
   - Clicks checkbox
   - Material rendering switches between solid/wireframe
   - Redux updates state in real-time
4. **Change Material Type:**
   - Opens Material dropdown
   - Selects different material (standard, metallic, plastic, leather)
   - ModelViewer applies new material properties
   - Redux updates state
5. **Change HDRI Environment:**
   - Opens HDRI dropdown
   - Selects environment preset (sunset, dawn, etc.)
   - Lighting/reflection in scene updates
   - Redux updates state
6. **Save Settings:**
   - Clicks "Save Settings" button
   - Button shows inline spinner
   - POST request to /settings endpoint
   - MongoDB upsert creates/updates Settings document
   - Success message or error displayed
   - Button returns to normal state

**Success Criteria:**
- All changes reflect immediately in 3D viewer
- Settings persist in database when saved
- Can reload and see saved settings

**Error Handling:**
- Missing media_id → Validation error, "Media ID required"
- Invalid color format → Form validation
- Invalid material type → 400 error from backend
- Server error → Generic error message: "Failed to save settings"

---

### Use Case 3: Delete Media and Associated Data

**Actor:** User

**Preconditions:**
- Model is loaded in viewer
- Delete button is visible

**Steps:**
1. User clicks "Delete Media" button
2. Button text changes to "Deleting..." with loader
3. DELETE request sent to /media/:mediaId
4. Backend retrieves Media document
5. Physical file deleted from Cloudinary storage
6. Media document deleted from MongoDB
7. All associated Settings cascade-deleted
8. Frontend receives success response
9. Redux mediaSlice clears modelUrl and mediaId
10. 3D viewer becomes empty
11. Upload section ready for new upload

**Success Criteria:**
- Model disappears from viewer
- Files deleted from Cloudinary
- Database records removed
- Application returns to initial state

**Error Handling:**
- Media not found → 404 error
- File deletion from Cloudinary fails → Continues, DB record still deleted
- File system errors → Error handling in catch block

---

### Use Case 4: Persistent Settings Across Sessions

**Actor:** User

**Preconditions:**
- User has uploaded a model
- User has customized and saved settings

**Steps:**
1. User closes application
2. Later, user returns to application
3. Frontend initializes
4. Optionally, fetchLatestMedia action can load last model
5. For that media, fetchSettings retrieves saved settings
6. Redux settingsSlice updates with fetched data
7. ModelViewer renders with those saved settings
8. User sees previously saved configuration

**Success Criteria:**
- Settings persist across browser sessions
- Colors, materials, and HDRI match previous session
- No manual reconfiguration needed

---

## Error Handling

### Backend Error Handling Strategy

#### 1. Global Error Handler Middleware
```javascript
// Catches all errors from async operations
// Standardizes error response format
// Handles specific error types with appropriate HTTP status codes
```

**Error Response Format:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Clear error description",
  "stack": "Error stack trace (dev only)"
}
```

#### 2. Specific Error Types Handled

| Error Type | Causes | HTTP Status | Message |
|-----------|--------|-------------|---------|
| ValidationError | Invalid MongoDB schema fields | 400 | Field-specific messages concatenated |
| Duplicate Key | Unique constraint violation | 400 | "Duplicate field value entered" |
| JsonWebTokenError | Invalid/malformed token | 401 | "Invalid token" |
| TokenExpiredError | Expired JWT | 401 | "Token has expired" |
| MulterError | File upload issues | 400 | File size, count, or field errors |
| Custom AppError | Business logic errors | 400-500 | Developer-defined messages |
| Generic Error | Uncaught errors | 500 | Generic "Internal Server Error" |

#### 3. Async Error Wrapper
```javascript
// Wraps all async controllers
// Catches unhandled promise rejections
// Forwards to error handler middleware
const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### Frontend Error Handling Strategy

#### 1. Redux AsyncThunk Error Handling
```javascript
// Each thunk has rejected case
// Stores error message in state.error
// Components display error UI based on error state
```

#### 2. Error Display Components
- UploadSection: Shows error in light red box
- SettingsPanel: Shows error in light red box
- Auto-clear: Can be enhanced to clear after timeout

#### 3. User Feedback Mechanism
- **Loading State:** Spinner and disabled inputs
- **Error State:** Red error box with message
- **Success State:** Button returns to normal, settings persist
- **Retry:** User can re-attempt failed operations

---

## State Management

### Redux Architecture

```
Redux Store
├── mediaSlice
│   ├── modelUrl: string | null
│   ├── mediaId: ObjectId | null
│   ├── isLoading: boolean
│   ├── isDeleting: boolean
│   ├── error: string | null
│   └── Actions:
│       ├── uploadModel (async)
│       ├── deleteModel (async)
│       ├── fetchLatestMedia (async)
│       └── clearMedia (sync)
│
└── settingsSlice
    ├── backgroundColor: string
    ├── wireframe_mode: boolean
    ├── material_type: string
    ├── hdri_preset: string
    ├── isLoading: boolean
    ├── isSaving: boolean
    ├── error: string | null
    └── Actions:
        ├── saveSettings (async)
        ├── fetchSettings (async)
        ├── setLocalSettings (sync)
        └── clearSettings (sync)
```

### Data Flow

#### Upload Flow:
```
User Input (file) 
  → UploadSection component
    → dispatch(uploadModel(file))
      → Redux thunk pending state
        → isLoading = true
          → Component shows spinner
            → Axios POST to /media/upload
              → Backend validation & Cloudinary upload
                → Response: { file_url, media_id }
                  → Redux thunk fulfilled
                    → mediaSlice updates
                      → ModelViewer receives URL
                        → 3D model renders
```

#### Settings Save Flow:
```
User Changes (color, material, etc)
  → SettingsPanel component
    → dispatch(setLocalSettings(data))
      → Redux reducer updates state
        → settingSlice updates immediately
          → ModelViewer reacts to state change
            → 3D viewer updates in real-time
              → User clicks "Save Settings"
                → dispatch(saveSettings(data))
                  → Redux thunk pending
                    → isSaving = true
                      → Button shows spinner
                        → Axios POST to /settings
                          → Backend validation & MongoDB upsert
                            → Response: { data: Settings }
                              → Redux thunk fulfilled
                                → settingSlice updates from server
                                  → Confirmation (error or success)
```

### Key Principles

1. **Separation of Concerns:** Models handle data, controllers handle logic, routes handle endpoints
2. **Error Propagation:** Errors bubble up to centralized handler
3. **Real-time Feedback:** Loading states, errors, and spinners for UX
4. **Async Operations:** Redux thunks handle API calls with pending/fulfilled/rejected states
5. **Local State:** Pre-saving updates (color, material) use local state updates for responsiveness

---

## Architecture Diagrams

### Request Response Lifecycle

```
FRONTEND                                BACKEND

User Action                              
    ↓
Dispatch Redux Action
    ↓
Thunk Pending State (isLoading = true)
    ↓
Axios API Request ────────────────→ Express Route
                                        ↓
                                    Controller Logic
                                        ↓
                                    Validation
                                        ↓
                                    DB Operation / File Upload
                                        ↓
                                    Response Builder
Response ←──────────────────────── JSON Response
    ↓
Thunk Fulfilled/Rejected
    ↓
Redux State Update
    ↓
Component Re-render
    ↓
UI Updated (spinner removed, data displayed)
```

### File Upload Workflow

```
Browser (React)
    ↓
FormData with file
    ↓
Axios POST /media/upload
    ↓ (multipart form data)
Express Server
    ↓
Multer Middleware
    ↓
Validate File Type
    ↓
Upload to Cloudinary
    ↓ (async)
Cloudinary Returns URL
    ↓
Create MongoDB Document
    ↓
Return Response
    ↓ (JSON: { file_url, media_id })
Frontend Redux Update
    ↓
React Component Re-render
    ↓
3D Viewer Loads Model
```

---

## Summary

This MERN stack application implements a professional full-stack architecture with:

- **MVC Pattern:** Clear separation between Models, Controllers, and Routes
- **Redux State Management:** Centralized state with async thunk handling
- **Error Handling:** Comprehensive error middleware with specific error type handling
- **Real-time Feedback:** Loading states, spinners, and error messages
- **Scalable Structure:** Easy to add new features, models, and routes
- **Best Practices:** Async error wrappers, validation, cascade deletion, upsert patterns

The documentation covers technical implementation, API contracts, data flow, and use cases for developers maintaining or extending this application.

---

**Last Updated:** February 19, 2026
**Version:** 1.0.0
