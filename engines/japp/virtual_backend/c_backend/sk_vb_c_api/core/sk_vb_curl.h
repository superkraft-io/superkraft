#pragma once

#include <JuceHeader.h>
#include "../libs/cpr/cpr/cpr.h"
#include "../../libs/ssc/json.hh"

class SK_CURL_Request {
public:
    unsigned long long id;
    String url;
    std::function<void(const char*)> onRequestCb;

    
    SK_CURL_Request(unsigned long long _id, const String& _url, std::function<void(const char*)> _onRequestCb) : id(_id), url(_url), onRequestCb(_onRequestCb) {
        
    }
            

    void call()  {
        auto future_text = cpr::PostCallback([this](cpr::Response r) {
            onRequestCb(r.text.c_str());
            //return r.text;
        }, cpr::Url{ url.toStdString()});

        // Sometime later
        /*if (future_text.wait_for(std::chrono::seconds(0)) == std::future_status::ready) {
            std::cout << future_text.get() << std::endl;
        }*/
    }
};

class SK_CURL {
public:
    unsigned long long requestIdx = 0;
    std::vector<SK_CURL_Request*> requests;

    SK_CURL_Request* findRequestByID(unsigned long long reqID) {
        for (SK_CURL_Request* request : requests) {
            if (request->id == reqID) return request;
        }
        return nullptr;
    }

    void createRequest(const String& url, const String& type = "GET") {
        requestIdx++;
        auto callback = std::bind(&SK_CURL::onRequestCallback, this, std::placeholders::_1);
        requests.push_back(new SK_CURL_Request(requestIdx, url, callback));
        SK_CURL_Request* request = requests.back();
        request->call();
        
    }

    void onRequestCallback(const char* data) {
        // Handle the callback here
        std::cout << "Callback received data: " << data << std::endl;
    }
};
