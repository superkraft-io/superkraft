#pragma once

using namespace juce;

#include <JuceHeader.h>
#include "../ssc/core/json.hh"

#include "../simdjson/simdjson.h"

using namespace std::chrono;
using namespace simdjson;

class SK_FS {
public:
    std::function<void(std::int64_t, std::string)> respondToCallback;

    static String SK_FS::getProjectPath() {
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

	String SK_FS::handle_IPC_Msg(int64 msgIdx, DynamicObject* obj) {
        String infoStr = obj->getProperty("data");

        auto start = high_resolution_clock::now();

        std::string str = infoStr.toStdString();

        ondemand::parser parser;
        ondemand::document doc = parser.iterate(str);
        auto _data = doc.find_field("data").get_array();
        //int64_t val = _data.at(0);
        
        size_t arraySize = _data.count_elements();
        int64_t* _array = new int64_t[arraySize];

        size_t i = 0;
        for (auto value : _data) {
            _array[i] = value;
            i++;
        }




        

        auto stop = high_resolution_clock::now();

        auto duration = duration_cast<milliseconds>(stop - start);


        for (size_t _i = 0; _i < arraySize; _i++) {
            auto value = _array[_i];
            //DBG(String(value));
        }

        var info = JSON::fromString(infoStr);

        String operation = info.getProperty("operation", "");
        String path = info.getProperty("path", "");
        String data = info.getProperty("data", "");

        String fullPath = SK_FS::getProjectPath() + "/assets" + path;

        String res;

        if (operation == "access"   ) access    (msgIdx, path);
        if (operation == "stat"     ) stat      (msgIdx, path);
        if (operation == "writeFile") writeFile (msgIdx, path, data);
        if (operation == "readFile" ) readFile  (msgIdx, path);
        if (operation == "readdir"  ) readdir   (msgIdx, fullPath);
        if (operation == "readJSON" ) readJSON  (msgIdx, path);
        if (operation == "writeJSON") writeJSON (msgIdx, path, data);

        return juce::String(res);
	};

    void access(int64 msgIdx, String path) {
        int x = 0;
    }

    void stat(int64 msgIdx, String path) {
        int x = 0;
    }

    void writeFile(int64 msgIdx, String path, String data) {
        int x = 0;
    }

    void readFile(int64 msgIdx, String path) {
        int x = 0;
    }

    void readdir(int64 msgIdx, String path) {
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

        //respondToCallback(msgIdx, juce::String(juce::CharPointer_UTF8(tempstr.c_str())).toStdString());
    }

    void readJSON(int64 msgIdx, String path) {
        int x = 0;
    }

    void writeJSON(int64 msgIdx, String path, String data) {
        int x = 0;
    }
};
