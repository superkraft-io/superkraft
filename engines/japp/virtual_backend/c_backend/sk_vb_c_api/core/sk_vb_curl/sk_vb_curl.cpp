#pragma once

#include <JuceHeader.h>
#include "sk_vb_curl.h"
#include "../../libs/ssc/json.hh"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../libs/curl/curl.h"

typedef size_t WriteMemoryCallback(void* contents, size_t size, size_t nmemb, void* userp);
    
SK_CURL_Request::SK_CURL_Request(unsigned long long _id, const String& _url, std::function<void(const char*)> _onRequestCb) : id(_id), url(_url), onRequestCb(_onRequestCb) {
        
}
            

size_t SK_CURL_Request::writeMemoryCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    size_t realsize = size * nmemb;
    struct MemoryStruct* mem = (struct MemoryStruct*)userp;

    char* ptr = (char*)realloc(mem->memory, mem->size + realsize + 1);
    if (ptr == NULL) {
        printf("error: not enough memory\n");
        return 0;
    }

    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;

    return realsize;
}

void SK_CURL_Request::call()  {

    CURL* curl_handle;
    CURLcode res;

    struct MemoryStruct chunk;
    chunk.memory = (char*)malloc(1);
    chunk.size = 0;

    curl_handle = curl_easy_init();
    if (curl_handle) {
        curl_easy_setopt(curl_handle, CURLOPT_URL, url.toStdString());
        curl_easy_setopt(curl_handle, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, writeMemoryCallback);
        curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, (void*)&chunk);
        curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, "libcurl-agent/1.0");

        res = curl_easy_perform(curl_handle);

        if (res != CURLE_OK) {
            fprintf(stderr, "error: %s\n", curl_easy_strerror(res));
        }
        else {
            printf("Size: %lu\n", (unsigned long)chunk.size);
            printf("Data: %s\n", chunk.memory);
        }
        curl_easy_cleanup(curl_handle);
        free(chunk.memory);
    }

    /*auto future_text = cpr::PostCallback([this](cpr::Response r) {
        onRequestCb(r.text.c_str());
        //return r.text;
    }, cpr::Url{ url.toStdString()});
    */

    // Sometime later
    /*if (future_text.wait_for(std::chrono::seconds(0)) == std::future_status::ready) {
        std::cout << future_text.get() << std::endl;
    }*/
}



SK_CURL_Request* SK_CURL::findRequestByID(unsigned long long reqID) {
    for (SK_CURL_Request* request : requests) {
        if (request->id == reqID) return request;
    }
    return nullptr;
}

void SK_CURL::createRequest(const String& url, const String& type) {
    requestIdx++;
    auto callback = std::bind(&SK_CURL::onRequestCallback, this, std::placeholders::_1);
    requests.push_back(new SK_CURL_Request(requestIdx, url, callback));
    SK_CURL_Request* request = requests.back();
    request->call();
        
}

void SK_CURL::onRequestCallback(const char* data) {
    // Handle the callback here
    std::cout << "Callback received data: " << data << std::endl;
}
