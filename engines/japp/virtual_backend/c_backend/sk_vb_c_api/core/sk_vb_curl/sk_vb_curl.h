#pragma once

#include <JuceHeader.h>
//#include "../libs/cpr/cpr.h"
#include "../../libs/ssc/json.hh"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "curl/curl.h"

struct MemoryStruct {
    char* memory;
    size_t size;
};






class SK_CURL_Request {
public:
    unsigned long long id;
    String url;
    std::function<void(const char*)> onRequestCb;

    typedef size_t WriteMemoryCallback(void* contents, size_t size, size_t nmemb, void* userp);
    
    SK_CURL_Request(unsigned long long _id, const String& _url, std::function<void(const char*)> _onRequestCb);
            


    void call();
};

class SK_CURL {
public:
    unsigned long long requestIdx = 0;
    std::vector<SK_CURL_Request*> requests;

    SK_CURL_Request* findRequestByID(unsigned long long reqID);

    void createRequest(const String& url, const String& type = "GET");

    void onRequestCallback(const char* data);
};
