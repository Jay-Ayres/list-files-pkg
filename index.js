const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

var obj = {
  addAndCount: function(arrayOfFiles) {
    let totalSize = 0;
    let totalFiles = 0;

    arrayOfFiles.forEach(function(file) {
      totalSize += file.size;
      totalFiles++;
    });

    return {
      totalSize: totalSize,
      totalFiles: totalFiles
    };
  },

  sortBySize: function(arrayOfFiles) {
    arrayOfFiles.sort(function(a, b) {
      if (a.size < b.size) {
        return -1;
      }
      if (a.size > b.size) {
        return 1;
      }

      // names must be equal
      return 0;
    });

    return arrayOfFiles;
  },

  convertBytes: function(_bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (_bytes == 0) {
      return "n/a";
    }

    const i = parseInt(Math.floor(Math.log(_bytes) / Math.log(1024)));

    if (i == 0) {
      return _bytes + " " + sizes[i];
    }

    return (_bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  },

  getAllFiles: function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
      const document = {
        id: uuidv4(),
        name: null,
        size: null,
        fsize: null,
        mtime: null
      };

      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = obj.getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        const documentPath = path.join(dirPath, file);

        const { size, mtime } = fs.statSync(documentPath);

        document.name = documentPath;
        document.size = size;
        document.fsize = obj.convertBytes(size);
        document.mtime = mtime;

        arrayOfFiles.push(document);
      }
    });

    return arrayOfFiles;
  },

  getOrderedlist: function(dirPath) {
    const orderedlist = {
      files: null,
      totalSize: null,
      totalFiles: 0
    };

    const allFiles = this.getAllFiles(dirPath);
    const orderedFiles = this.sortBySize(allFiles);
    const { totalSize, totalFiles } = this.addAndCount(orderedFiles);

    orderedlist.files = orderedFiles;
    orderedlist.totalSize = this.convertBytes(totalSize);
    orderedlist.totalFiles = totalFiles;

    return orderedlist;
  }
};

module.exports = obj;
