#pragma once

#include "../sk_virtual_backend.hxx"

#include "sk_vb_fs.h"
#include "sk_vb_c_api.h"

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

    if (operation == "access") access(msgIdx, path);
    if (operation == "stat") stat(msgIdx, path);
    if (operation == "writeFile") writeFile(msgIdx, path, data);
    if (operation == "readFile") readFile(msgIdx, path);
    if (operation == "readdir") readdir(msgIdx, fullPath);
    if (operation == "readJSON") readJSON(msgIdx, path);
    if (operation == "writeJSON") writeJSON(msgIdx, path, data);

    return juce::String(res);
};

void SK_FS::access(int64 msgIdx, String path) {
    int x = 0;
}

void SK_FS::stat(int64 msgIdx, String path) {
    int x = 0;
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