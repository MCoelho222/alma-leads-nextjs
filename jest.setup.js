require("@testing-library/jest-dom");

// Mock File and FormData for Node.js environment FIRST
if (typeof File === "undefined") {
  global.File = class File {
    constructor(chunks, name, options = {}) {
      this.chunks = chunks;
      this.name = name;
      this.type = options.type || "";
      this.size = chunks.reduce((acc, chunk) => acc + (chunk.length || 0), 0);
      this.lastModified = Date.now();
    }

    arrayBuffer() {
      // Create a proper ArrayBuffer from the chunks
      const totalSize = this.chunks.reduce((acc, chunk) => acc + (chunk.length || 0), 0);
      const buffer = new ArrayBuffer(totalSize);
      const view = new Uint8Array(buffer);
      let offset = 0;

      for (const chunk of this.chunks) {
        if (typeof chunk === "string") {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(chunk);
          view.set(encoded, offset);
          offset += encoded.length;
        } else if (chunk instanceof Uint8Array) {
          view.set(chunk, offset);
          offset += chunk.length;
        }
      }

      return Promise.resolve(buffer);
    }

    stream() {
      // Simple stream implementation for testing
      return new ReadableStream({
        start(controller) {
          for (const chunk of this.chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
    }
  };
}

if (typeof FormData === "undefined") {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }

    append(key, value) {
      if (!this.data.has(key)) {
        this.data.set(key, []);
      }
      this.data.get(key).push(value);
    }

    get(key) {
      const values = this.data.get(key);
      return values ? values[0] : null;
    }

    getAll(key) {
      return this.data.get(key) || [];
    }

    entries() {
      const entries = [];
      for (const [key, values] of this.data) {
        for (const value of values) {
          entries.push([key, value]);
        }
      }
      return entries[Symbol.iterator]();
    }

    has(key) {
      return this.data.has(key);
    }

    set(key, value) {
      this.data.set(key, [value]);
    }

    delete(key) {
      return this.data.delete(key);
    }
  };
}

// Polyfills for Node.js environment
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

// Import node-fetch for web APIs compatibility
require("whatwg-fetch");

// Import whatwg-fetch for Request/Response polyfills
require("whatwg-fetch");

// Override the File class after whatwg-fetch import to ensure our implementation is used
global.File = class File {
  constructor(fileBits, fileName, options = {}) {
    this.fileBits = fileBits;
    this.name = fileName;
    this.type = options.type || "";
    this.lastModified = options.lastModified || Date.now();
    this.size = this._calculateSize(fileBits);
  }

  _calculateSize(fileBits) {
    if (Array.isArray(fileBits)) {
      return fileBits.reduce((total, bit) => {
        if (typeof bit === "string") {
          return total + bit.length;
        }
        if (bit instanceof ArrayBuffer) {
          return total + bit.byteLength;
        }
        if (bit instanceof Uint8Array) {
          return total + bit.length;
        }
        return total;
      }, 0);
    }
    return 0;
  }

  arrayBuffer() {
    // Return a Promise that resolves to an ArrayBuffer
    return Promise.resolve().then(() => {
      const totalSize = this.size;
      const buffer = new ArrayBuffer(totalSize);
      const view = new Uint8Array(buffer);

      let offset = 0;
      if (Array.isArray(this.fileBits)) {
        this.fileBits.forEach((bit) => {
          if (typeof bit === "string") {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(bit);
            view.set(encoded, offset);
            offset += encoded.length;
          } else if (bit instanceof ArrayBuffer) {
            view.set(new Uint8Array(bit), offset);
            offset += bit.byteLength;
          } else if (bit instanceof Uint8Array) {
            view.set(bit, offset);
            offset += bit.length;
          }
        });
      }

      return buffer;
    });
  }

  stream() {
    throw new Error("File.stream() not implemented in test environment");
  }

  text() {
    return Promise.resolve(new TextDecoder().decode(this.arrayBuffer()));
  }

  slice(start, end, contentType) {
    throw new Error("File.slice() not implemented in test environment");
  }
};

// Override FormData after whatwg-fetch import as well
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }

  append(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    this.data.get(key).push(value);
  }

  get(key) {
    const values = this.data.get(key);
    return values ? values[0] : null;
  }

  getAll(key) {
    return this.data.get(key) || [];
  }

  entries() {
    const entries = [];
    for (const [key, values] of this.data) {
      for (const value of values) {
        entries.push([key, value]);
      }
    }
    return entries[Symbol.iterator]();
  }

  has(key) {
    return this.data.has(key);
  }

  set(key, value) {
    this.data.set(key, [value]);
  }

  delete(key) {
    return this.data.delete(key);
  }
};

// Mock next/server module
jest.mock("next/server", () => ({
  NextRequest: class NextRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || "GET";
      this._body = options.body;
      this._headers = new Map();

      // Set headers from options
      if (options.headers) {
        if (options.headers instanceof Map) {
          this._headers = new Map(options.headers);
        } else if (typeof options.headers === "object") {
          Object.entries(options.headers).forEach(([key, value]) => {
            this._headers.set(key.toLowerCase(), value);
          });
        }
      }
    }

    async formData() {
      if (this._body instanceof FormData) {
        return this._body;
      }
      throw new Error("Request body is not FormData");
    }

    get headers() {
      return {
        get: (name) => this._headers.get(name.toLowerCase()) || null,
      };
    }
  },
  NextResponse: {
    json: (data, options = {}) => {
      const response = {
        status: options.status || 200,
        json: async () => data,
        headers: options.headers || {},
      };
      return response;
    },
  },
}));

// Mock NextRequest for integration tests (global fallback)
global.NextRequest = class NextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || "GET";
    this._body = options.body;
    this._headers = new Map();

    // Set headers from options
    if (options.headers) {
      if (options.headers instanceof Map) {
        this._headers = new Map(options.headers);
      } else if (typeof options.headers === "object") {
        Object.entries(options.headers).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      }
    }
  }

  async formData() {
    if (this._body instanceof FormData) {
      return this._body;
    }
    throw new Error("Request body is not FormData");
  }

  get headers() {
    return {
      get: (name) => this._headers.get(name.toLowerCase()) || null,
    };
  }
};
global.File = class File {
  constructor(fileBits, fileName, options = {}) {
    this.fileBits = fileBits;
    this.name = fileName;
    this.type = options.type || "";
    this.lastModified = options.lastModified || Date.now();
    this.size = this._calculateSize(fileBits);
  }

  _calculateSize(fileBits) {
    if (Array.isArray(fileBits)) {
      return fileBits.reduce((total, bit) => {
        if (typeof bit === "string") {
          return total + bit.length;
        }
        if (bit instanceof ArrayBuffer) {
          return total + bit.byteLength;
        }
        if (bit instanceof Uint8Array) {
          return total + bit.length;
        }
        return total;
      }, 0);
    }
    return 0;
  }

  arrayBuffer() {
    // Return a Promise that resolves to an ArrayBuffer
    return Promise.resolve().then(() => {
      const totalSize = this.size;
      const buffer = new ArrayBuffer(totalSize);
      const view = new Uint8Array(buffer);

      let offset = 0;
      if (Array.isArray(this.fileBits)) {
        this.fileBits.forEach((bit) => {
          if (typeof bit === "string") {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(bit);
            view.set(encoded, offset);
            offset += encoded.length;
          } else if (bit instanceof ArrayBuffer) {
            view.set(new Uint8Array(bit), offset);
            offset += bit.byteLength;
          } else if (bit instanceof Uint8Array) {
            view.set(bit, offset);
            offset += bit.length;
          }
        });
      }

      return buffer;
    });
  }

  stream() {
    throw new Error("File.stream() not implemented in test environment");
  }

  text() {
    return Promise.resolve(new TextDecoder().decode(this.arrayBuffer()));
  }

  slice(start, end, contentType) {
    throw new Error("File.slice() not implemented in test environment");
  }
};
global.File = class File {
  constructor(chunks, name, options = {}) {
    this.chunks = chunks;
    this.name = name;
    this.type = options.type || "";
    this.size = chunks.reduce((acc, chunk) => acc + (chunk.length || 0), 0);
    this.lastModified = Date.now();
  }

  arrayBuffer() {
    // Create a proper ArrayBuffer from the chunks
    const totalSize = this.chunks.reduce((acc, chunk) => acc + (chunk.length || 0), 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new Uint8Array(buffer);
    let offset = 0;

    for (const chunk of this.chunks) {
      if (typeof chunk === "string") {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(chunk);
        view.set(encoded, offset);
        offset += encoded.length;
      } else if (chunk instanceof Uint8Array) {
        view.set(chunk, offset);
        offset += chunk.length;
      }
    }

    return Promise.resolve(buffer);
  }

  stream() {
    // Simple stream implementation for testing
    return new ReadableStream({
      start(controller) {
        for (const chunk of this.chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });
  }
};

// Mock NextResponse for API route testing
if (typeof global.NextResponse === "undefined") {
  global.NextResponse = {
    json: (data, init = {}) => {
      const response = {
        json: async () => data,
        status: init.status || 200,
        headers: new Map(Object.entries(init.headers || {})),
        ok: (init.status || 200) >= 200 && (init.status || 200) < 300,
      };
      return response;
    },
  };
}

// Make NextResponse available as a module mock
jest.mock("next/server", () => ({
  NextResponse: global.NextResponse,
}));
