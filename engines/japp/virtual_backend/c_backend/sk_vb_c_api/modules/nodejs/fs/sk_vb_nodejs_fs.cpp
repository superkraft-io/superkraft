#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_fs.h"

#if defined(_WIN32)
    #include <windows.h>
#elif defined(__APPLE__)
    #include <sys/stat.h>
    #include <ctime>
    #include <unistd.h>

    struct FileComparator {
        static int compareElements(const File& file1, const File& file2) {
            // Compare the filenames in a case-insensitive manner
            return file1.getFileName().compareIgnoreCase(file2.getFileName());
        }
    };
#endif

#include <iostream>
#include <cstdio>
#include <filesystem>

namespace fs = std::filesystem;

struct FileInfo {
    uint64_t volumeSerialNumber;
    std::string mode;
    int numberOfLinks;

    uint64_t ino;

    char* atime;
    char* mtime;
    char* ctime;
    };


SK_FS::SK_FS(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

String SK_FS::getProjectPath() {
    auto start = File::getSpecialLocation(File::currentExecutableFile);

    File stoppedFile;

    while (start.exists() && !start.isRoot()) {
        

        
        stoppedFile = start.getSiblingFile("assets");

        String path = stoppedFile.getFullPathName();

        if (stoppedFile.isDirectory()) {
            stoppedFile = stoppedFile;
            break;
        }

        start = start.getParentDirectory();
    }

    return stoppedFile.getParentDirectory().getFullPathName().replace("\\", "/");
}

void SK_FS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    

    String operation = info.getProperty("operation", "");
    String path = info.getProperty("path", "");

    if (path.substring(0, 7) == "sk_vfs/") {
        vbe->sk_c_api->sk->vfs->handle_IPC_Msg(msgID, obj, responseData);
        return;
    }

    if (vbe->mode != "debug") {
        vbe->sk_c_api->sk->bdfs->handle_IPC_Msg(msgID, obj, responseData);
        return;
    }

    String data = info.getProperty("data", "");

    
    String fullPath = path;

    //check if file exists using path as-is. If it does exist, then most likely the path is n absolute path, se we do not prepend project path.
    /*if (!fs::exists(path.toStdString())) {
        if (operation != "mkdir") {
            fullPath = SK_FS::getProjectPath() + "/assets" + path;
        }
    }*/

    if (!File::isAbsolutePath(path)) {
        if (operation != "mkdir") {
            fullPath = SK_FS::getProjectPath() + "/assets" + path;
        }
    }

    if (operation == "access") access(msgID, fullPath, responseData);
    else if (operation == "stat") _stat(msgID, fullPath, responseData);
    else if (operation == "writeFile") writeFile(msgID, fullPath, data, responseData);
    else if (operation == "readFile") readFile(msgID, fullPath, responseData);
    else if (operation == "readdir") readdir(msgID, fullPath, responseData);
    else if (operation == "unlink") unlink(msgID, fullPath, responseData);
    else if (operation == "mkdir") mkdir(msgID, fullPath, responseData);
};


void SK_FS::access(String msgID, String path, String& responseData) {
    File file(path);
    responseData = "{\"access\":" + String((file.exists() ? "true" : "false")) + "}";
}

void SK_FS::_stat(String msgID, String path, String& responseData) {
    File file(path);

    if (!file.exists()) {
        responseData = SK_IPC::Error("ENOENT");
        return;
    }


    
    FileInfo fileInfo;
    
    auto statInfo = SSC::JSON::Object();

    if (file.isDirectory()) {
        statInfo = SSC::JSON::Object(SSC::JSON::Object::Entries{
            {"type", "dir"},
            {"dev", ""},
            {"mode", -1},
            {"nlink", 0},
            {"uid", 0},
            {"gid", 0},
            {"rdev", 0},
            {"blksize", -1},
            {"ino",0},
            {"size", file.getSize()},
            {"blocks", -1},
            {"atimeMs", file.getLastAccessTime().getHighResolutionTicks()},
            {"mtimeMs", file.getLastModificationTime().getHighResolutionTicks()},
            {"ctimeMs", file.getCreationTime().getHighResolutionTicks()},
            {"birthtimeMs", String(file.getCreationTime().getMillisecondCounter()).toStdString()},
            {"atime"    , file.getLastAccessTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"mtime"    , file.getLastModificationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"ctime"    , file.getCreationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"birthtime", file.getCreationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()}
            });
    }
    else {
        std::string filePath = file.getFullPathName().toStdString();
        
        #if defined(_WIN32)
            HANDLE hFile = CreateFile(filePath.c_str(), GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
            if (hFile == INVALID_HANDLE_VALUE) {
                responseData = SK_IPC::Error("ENOENT");
                return;
            }

            BY_HANDLE_FILE_INFORMATION _fileInfo;
            if (!GetFileInformationByHandle(hFile, &_fileInfo)) {
                responseData = SK_IPC::Error("ENOENT");
                CloseHandle(hFile);
                return;
            }

            CloseHandle(hFile);
        
            fileInfo.volumeSerialNumber = (uint64_t)_fileInfo.dwVolumeSerialNumber;
            fileInfo.numberOfLinks = (uint64_t)_fileInfo.nNumberOfLinks;
            fileInfo.ino = ((uint64_t)_fileInfo.nFileIndexHigh << 32) | _fileInfo.nFileIndexLow;
        #elif defined(__APPLE__)
        
            struct stat fileStat;

            // Get file statistics
            if (stat(filePath.c_str(), &fileStat) != 0) {
                std::cerr << "Failed to get file stats for " << filePath << std::endl;
                return;
            }

            // Print file size
            std::cout << "File size: " << fileStat.st_size << " bytes" << std::endl;

            // Print file permissions
            char* permissions;
            /*permissions << ((fileStat.st_mode & S_IRUSR) ? "r" : "-")
                          << ((fileStat.st_mode & S_IWUSR) ? "w" : "-")
                          << ((fileStat.st_mode & S_IXUSR) ? "x" : "-")
                          << ((fileStat.st_mode & S_IRGRP) ? "r" : "-")
                          << ((fileStat.st_mode & S_IWGRP) ? "w" : "-")
                          << ((fileStat.st_mode & S_IXGRP) ? "x" : "-")
                          << ((fileStat.st_mode & S_IROTH) ? "r" : "-")
                          << ((fileStat.st_mode & S_IWOTH) ? "w" : "-")
                          << ((fileStat.st_mode & S_IXOTH) ? "x" : "-")
                          << std::endl;
            */
        
            fileInfo.atime = std::ctime(&fileStat.st_atime);
            fileInfo.mtime = std::ctime(&fileStat.st_mtime);
            fileInfo.ctime = std::ctime(&fileStat.st_ctime);
        #endif
        

        statInfo = SSC::JSON::Object(SSC::JSON::Object::Entries{
            {"type", "file"},
            {"dev", fileInfo.volumeSerialNumber},
            {"mode", -1},
            {"nlink", fileInfo.numberOfLinks},
            {"uid", 0},
            {"gid", 0},
            {"rdev", 0},
            {"blksize", -1},
            {"ino", fileInfo.ino},
            {"size", file.getSize()},
            {"blocks", -1},
            {"atimeMs", file.getLastAccessTime().getHighResolutionTicks()},
            {"mtimeMs", file.getLastModificationTime().getHighResolutionTicks()},
            {"ctimeMs", file.getCreationTime().getHighResolutionTicks()},
            {"birthtimeMs", String(file.getCreationTime().getMillisecondCounter()).toStdString()},
            {"atime"    , file.getLastAccessTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"mtime"    , file.getLastModificationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"ctime"    , file.getCreationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()},
            {"birthtime", file.getCreationTime().formatted("%Y-%m-%dT%H:%M:%S.000Z").toStdString()}
        });
    }

   

    

    responseData = String(statInfo.str());

    //vbe->sk_c_api->ipc->respondToCallback(msgID, juce::String(juce::CharPointer_UTF8(tempstr.c_str())).toStdString());
}

void SK_FS::writeFile(String msgID, String path, String data, String& responseData) {
    File file(path);
    if (file.exists()) file.deleteFile();
    file.appendData(data.toStdString().c_str(), data.length());
}

void SK_FS::readFile(String msgID, String path, String& responseData) {
    File file(path);

    MemoryBlock mb;
    file.loadFileAsData(mb);

    String str = mb.toString();
    
    responseData = "\"" + Base64::toBase64(str.getCharPointer(), str.length()) + "\"";
}

void SK_FS::readdir(String msgID, String path, String& responseData) {
    SSC::JSON::Array fileList;


    File f(path);
    Array<File> list;
    list = f.findChildFiles(File::findFilesAndDirectories, false, "*");

    
    #if defined(__APPLE__)
        FileComparator sorter;
        list.sort(sorter);
    #endif
    
    
    for (int i = 0; i < list.size(); i++) {
        File file = list[i];


        fileList.push(SSC::JSON::Object::Entries{
            {"type", (file.isDirectory() == true ? "dir" : "file")},
            {"name", file.getFileName().toStdString()}
        });
    }
    
    

    responseData = String(fileList.str());
}

void SK_FS::unlink(String msgID, String path, String& responseData) {
    std::string filePath = path.toStdString();


    try {
        if (fs::remove(filePath)) {
            responseData = SK_IPC::OK;
        }
        else {
            responseData = SK_IPC::Error("EBUSY");
        }
    }
    catch (const fs::filesystem_error& e) {
        responseData = SK_IPC::Error(e.what());
    }
}


void SK_FS::mkdir(String msgID, String path, String& responseData) {
    std::string dirPath = path.toStdString();

    try {
        // Use create_directories to create the directory and all its parent directories
        if (fs::create_directories(dirPath)) {
            responseData = SK_IPC::OK;
        }
        else {
            responseData = SK_IPC::Error("EBUSY");
        }
    }
    catch (const fs::filesystem_error& e) {
        responseData = SK_IPC::Error(e.what());
    }
}
