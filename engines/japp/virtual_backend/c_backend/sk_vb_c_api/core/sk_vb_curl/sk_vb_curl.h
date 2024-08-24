#pragma once

#include <JuceHeader.h>

#include "../../../libs/ssc/json.hh"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <any>
#include "../../../libs/curl/curl.h"


class SK_VirtualBackend;

using Jayson = std::unordered_map<std::string, std::any>;

/*
using JaysonVariant = std::variant<std::string, int, long, double, float>;

class Jayson {
public:
    // Constructor to initialize with an initializer list
    Jayson(std::initializer_list<std::pair<const std::string, JaysonVariant>> init) : map_(init) {}

    // Template operator[] for non-const access
    template<typename JaysonElement>

    // Non-const operator[] for setting values
    JaysonVariant& operator[](const std::string& key) {
        return map_[key];
    }

    int operator[](const std::string& key) const {
        auto it = map_.find(key);
        if (it != map_.end()) {
            // Get the value with type checking
            if (auto val = std::get_if<int>(&it->second)) {
                return *val;
            }
            else {
                throw std::runtime_error("Type mismatch for key: " + key);
            }
        }
        else {
            throw std::runtime_error("Key not found: " + key);
        }
    }

    std::string operator[](const std::string& key) const {
        auto it = map_.find(key);
        if (it != map_.end()) {
            // Get the value with type checking
            if (auto val = std::get_if<std::string>(&it->second)) {
                return *val;
            }
            else {
                throw std::runtime_error("Type mismatch for key: " + key);
            }
        }
        else {
            throw std::runtime_error("Key not found: " + key);
        }
    }

private:
    // Map to hold key-value pairs with JaysonVariant as the value type
    std::unordered_map<std::string, JaysonVariant> map_;
};

*/

class SK_CURL_Request {
public:
    SK_VirtualBackend* vbe;

    typedef size_t WriteMemoryCallback(void* contents, size_t size, size_t nmemb, void* userp);
    
    SK_CURL_Request(SK_VirtualBackend* _vbe);
            

    Jayson call(Jayson  opt);
};

class SK_CURL {
public:
    SK_VirtualBackend* vbe;

    SK_CURL(SK_VirtualBackend* _vbe);

    Jayson createRequest(Jayson  opt);//const String& url, String data, String& type = "GET", String mimeType);

    Jayson get(Jayson opt);
    Jayson post(Jayson  opt);

    void onRequestCallback(const char* data);
};
