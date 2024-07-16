#pragma once

#include "../sk_virtual_backend.hxx"

#include "sk_vb_fs.h"
#include "sk_vb_c_api.h"

#include <windows.h>
#include <iostream>

using namespace std::chrono;
using namespace simdjson;

SK_FS::SK_FS(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

String SK_FS::getProjectPath() {
    auto start = File::getSpecialLocation(File::currentExecutableFile);

    File stoppedFile;

    while (start.exists() && !start.isRoot() && start.getFileName() != "Builds") {
        start = start.getParentDirectory();

        if (start.getFileName() == "Builds")
        {
            stoppedFile = start.getSiblingFile("Resources");
            if (stoppedFile.isDirectory()) {
                stoppedFile = stoppedFile;
                break;
            }

            stoppedFile = start.getSiblingFile("Source");
            if (stoppedFile.isDirectory()) {
                stoppedFile = stoppedFile;
                break;
            }
        }
    }

    return stoppedFile.getParentDirectory().getFullPathName().replace("\\", "/");
}

String SK_FS::handle_IPC_Msg(int64 msgIdx, DynamicObject *obj) {
    String infoStr = obj->getProperty("data");
    
    auto start = high_resolution_clock::now();

    var info = JSON::fromString(infoStr);

    /*Array doubleArray = info.getProperty("data", "").getArray();

    auto stop = high_resolution_clock::now();

    auto duration = duration_cast<milliseconds>(stop - start);
    
    FILE* fp = fopen("benchmark.txt", "wb");
    fprintf(fp, "%1.14lf\n", std::chrono::duration<double>(duration).count());
    fclose(fp);
    */

   

    String operation = info.getProperty("operation", "");
    String path = info.getProperty("path", "");
    String data = info.getProperty("data", "");

    String fullPath = SK_FS::getProjectPath() + "/assets" + path;

    String res;

    if (operation == "access") access(msgIdx, fullPath);
    if (operation == "stat") stat(msgIdx, fullPath);
    if (operation == "writeFile") writeFile(msgIdx, fullPath, data);
    if (operation == "readFile") readFile(msgIdx, fullPath);
    if (operation == "readdir") readdir(msgIdx, fullPath);
    if (operation == "readJSON") readJSON(msgIdx, fullPath);
    if (operation == "writeJSON") writeJSON(msgIdx, fullPath, data);

    return juce::String(res);
};

void SK_FS::respondError(int64 msgIdx, String error) {
    String res = "{\"error\":\"" + error + "\"}";
    vbe->sk_c_api->ipc->respondToCallback(msgIdx, res);
}

void SK_FS::access(int64 msgIdx, String path) {
    File file(path);
    String res = "{\"access\":" + String((file.exists() ? "true" : "false")) + "}";
    vbe->sk_c_api->ipc->respondToCallback(msgIdx, res);
}

void SK_FS::stat(int64 msgIdx, String path) {
    SSC::JSON::Array fileList;

    File file(path);

    if (!file.exists()) {
        respondError(msgIdx, "ENOENT");
        return;
    }


    HANDLE hFile = CreateFile(file.getFullPathName().toStdString().c_str(), GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE){
        respondError(msgIdx, "ENOENT");
        return;
    }

    BY_HANDLE_FILE_INFORMATION fileInfo;
    if (!GetFileInformationByHandle(hFile, &fileInfo)){
        respondError(msgIdx, "ENOENT");
        CloseHandle(hFile);
        return;
    }

    CloseHandle(hFile);

   

    auto statInfo = SSC::JSON::Object(SSC::JSON::Object::Entries{
        {"type", std::string((file.isDirectory() ? "dir" : "file"))},
        {"dev", (uint64_t)fileInfo.dwVolumeSerialNumber},
        {"mode", -1},
        {"nlink", (uint64_t)fileInfo.nNumberOfLinks},
        {"uid", 0},
        {"gid", 0},
        {"rdev", 0},
        {"blksize", -1},
        {"ino", ((uint64_t)fileInfo.nFileIndexHigh << 32) | fileInfo.nFileIndexLow},
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

    
    auto tempstr = statInfo.str();
    DBG(tempstr);

    vbe->sk_c_api->ipc->respondToCallback(msgIdx, juce::String(juce::CharPointer_UTF8(tempstr.c_str())).toStdString());
}

void SK_FS::writeFile(int64 msgIdx, String path, String data) {
    int x = 0;
}

void SK_FS::readFile(int64 msgIdx, String path) {
    int x = 0;
}

void SK_FS::readdir(int64 msgIdx, String path) {
    SSC::JSON::Array fileList;


    File f(path);
    Array<File> list;
    list = f.findChildFiles(File::findFilesAndDirectories, false, "*");

    for (int i = 0; i < list.size(); i++) {
        File file = list[i];


        fileList.push(SSC::JSON::Object::Entries{
            {"type", (file.isDirectory() == true ? "dir" : "file")},
            {"name", file.getFileName().toStdString()}
            });
    }

    auto tempstr = fileList.str();

    vbe->sk_c_api->ipc->respondToCallback(msgIdx, juce::String(juce::CharPointer_UTF8(tempstr.c_str())).toStdString());
}

void SK_FS::readJSON(int64 msgIdx, String path) {
    int x = 0;
}

void SK_FS::writeJSON(int64 msgIdx, String path, String data) {
    int x = 0;
}