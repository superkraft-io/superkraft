#pragma once

#include <JuceHeader.h>
#include "sk_vb_curl.h"

#include "../../sk_vbe/sk_vbe.hxx"

#include "../../libs/ssc/json.hh"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "curl/curl.h"




std::vector<std::string> splitString(const std::string& str, const std::string& delimiter)
{
    std::vector<std::string> result;
    size_t start = 0;
    size_t end = str.find(delimiter);

    while (end != std::string::npos)
    {
        result.push_back(str.substr(start, end - start));
        start = end + delimiter.length();
        end = str.find(delimiter, start);
    }

    result.push_back(str.substr(start));

    return result;
}



typedef size_t WriteMemoryCallback(void* contents, size_t size, size_t nmemb, void* userp);
    
SK_CURL_Request::SK_CURL_Request(SK_VirtualBackend* _vbe, unsigned long long _id, std::function<void(const char*)> _onRequestCb) : id(_id), onRequestCb(_onRequestCb) {
    vbe = _vbe;
}
            

size_t WriteCallback(char* contents, size_t size, size_t nmemb, void* userp)
{
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

Jayson SK_CURL_Request::call(Jayson opt)  {

    // Initialize the curl library
    curl_global_init(CURL_GLOBAL_DEFAULT);

    // Create a curl handle
    CURL* handle = curl_easy_init();

    try {

        if (vbe->mode == "debug"){
            curl_easy_setopt(handle, CURLOPT_SSL_VERIFYHOST, false);
            curl_easy_setopt(handle, CURLOPT_SSL_VERIFYPEER, false);
        }

        // Set headers
        struct curl_slist* headers = NULL;


        headers = curl_slist_append(headers, "charset: utf-8");
        std::string mimeTypeStr;

        try {
            mimeTypeStr = std::any_cast<const char*>(opt["mimeType"]);
        }
        catch (const std::bad_any_cast& e) {
            std::cerr << "Bad any_cast: " << e.what() << std::endl;
        }

        String mimeType = SK_VB_Helpers_MimeTypes::lookUpMimeType("foo." + mimeTypeStr);
        std::string hStr = "Accept: " + mimeType.toStdString();
        headers = curl_slist_append(headers, hStr.c_str());
        hStr = "Content-Type: " + mimeType.toStdString();
        headers = curl_slist_append(headers, hStr.c_str());

        const char* headersStr = std::any_cast<const char*>(opt["headers"]);


        std::vector<std::string> headersArr = splitString(headersStr, "<!-!>");
        for (const auto& item : headersArr)
        {
            DBG(item);
            headers = curl_slist_append(headers, item.c_str());
        }

        curl_easy_setopt(handle, CURLOPT_HTTPHEADER, headers);


        // Set the URL to request
        String url = std::any_cast<const char*>(opt["url"]);
        curl_easy_setopt(handle, CURLOPT_URL, url.toStdString().c_str());

        // Set the request method to POST
        String type = std::any_cast<const char*>(opt["type"]);
        curl_easy_setopt(handle, CURLOPT_CUSTOMREQUEST, type);

        // Set the request body
        const char* body = std::any_cast<const char*>(opt["body"]);
        curl_easy_setopt(handle, CURLOPT_POSTFIELDSIZE, (long)strlen(body));
        curl_easy_setopt(handle, CURLOPT_POSTFIELDS, body);
        //curl_easy_setopt(handle, CURLOPT_POST, 1);

        // Set redirect count
        long redirects = 5;
        if (opt["redirects"].type() == typeid(long)) redirects = std::any_cast<long>(opt["redirects"]);
        curl_easy_setopt(handle, CURLOPT_MAXREDIRS, redirects);
    
    

        // Set the callback function to handle the response

        std::string response;
        curl_easy_setopt(handle, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(handle, CURLOPT_WRITEDATA, &response);
    

        // Perform the request
        CURLcode result = curl_easy_perform(handle);

        // Clean up
        curl_easy_cleanup(handle);
        curl_global_cleanup();

        // Check the result
        if (result != CURLE_OK) {
            String err = curl_easy_strerror(result);
            return { {"error", err.toStdString().c_str() } };
        }





        return { {"error", nullptr}, {"data", response} };
    }
    catch (const std::bad_any_cast& e) {
        curl_easy_cleanup(handle);
        curl_global_cleanup();
        return { {"error", "failed web request"}};
    }
}



SK_CURL_Request* SK_CURL::findRequestByID(unsigned long long reqID) {
    for (SK_CURL_Request* request : requests) {
        if (request->id == reqID) return request;
    }
    return nullptr;
}







SK_CURL::SK_CURL(SK_VirtualBackend* _vbe) {
    vbe = _vbe;
}

Jayson SK_CURL::createRequest(Jayson opt){//const String& url, String data, const String& type) {
    requestIdx++;
    auto callback = std::bind(&SK_CURL::onRequestCallback, this, std::placeholders::_1);
    requests.push_back(new SK_CURL_Request(vbe, requestIdx, callback));
    SK_CURL_Request* request = requests.back();
    return request->call(opt);
}

Jayson SK_CURL::get(Jayson opt) {
    opt["type"] = "GET";
    return createRequest(opt);
}

Jayson SK_CURL::post(Jayson opt) {
    opt["type"] = "POST";
    return createRequest(opt);
}

void SK_CURL::onRequestCallback(const char* data) {
    // Handle the callback here
    std::cout << "Callback received data: " << data << std::endl;
}
