#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_web.h"

using namespace std::chrono;

SK_VB_Web::SK_VB_Web(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}





void SK_VB_Web::request(String msgID, var info, String& responseData) {
    String url = info.getProperty("url", "");
    
    //validate URL
    if (url == "") {
        responseData = "{\"error\":\"invalid_url\"}";
        return;
    }

    String body = info.getProperty("body", "{}");
    String mimeType = info.getProperty("mimeType", "");
    String headers = info.getProperty("headers", "");

    Jayson reqRes = vbe->sk_c_api->curl->post({
        {"url", url.toStdString().c_str()},
        {"body", body.toStdString().c_str()},
        {"mimeType", mimeType.toStdString().c_str()},
        {"headers", headers.toStdString().c_str()}
    });

    const char* error = nullptr;
    try {
        error = std::any_cast<const char*>(reqRes["error"]);
    }
    catch (const std::bad_any_cast& e) {
        //can't cast if it doesn't exist, therefor everything is ok
    };

    if (error != nullptr) {
        responseData = "{\"error\":\"" + String(error) + "\"}";
        return;
    }

    responseData = std::any_cast<std::string>(reqRes["data"]);
}

/*
void SK_VB_Web::request(String msgID, var info, String& responseData) {
    String url = info.getProperty("url", "");
    int timeout = info.getProperty("timeout", 7000);
    int follow = info.getProperty("follows", 5);


    String headers = info.getProperty("headers", "");
    
    var _body = "{\"hello\":\"test\"}";//info.getProperty("body", "{\"hello\":\"test\"}");
    String body = JSON::toString(_body);

    juce::URL _url(url);
    juce::StringPairArray responseHeaders;

    int statusCode = 0;


    _url = _url.withPOSTData(body);

    std::unique_ptr<juce::InputStream> stream(_url.createInputStream(true, nullptr, nullptr, headers, timeout, &responseHeaders, &statusCode, follow, "POST"));

    SSC::JSON::Object json;

    if (stream == nullptr) {
        json.set("error", "stream");
        json.set("status_code", statusCode);
    }
    else {
        json.set("data", stream->readEntireStreamAsString().toStdString());
    }

    std::string str = json.str();
    responseData = str;
}
*/


void SK_VB_Web::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

    String func = info.getProperty("func", "");

         if (func == "createProgressCallback") createProgressCallback(msgID, info, responseData);
    else if (func == "getProgress") getProgress(msgID, info, responseData);
    else if (func == "get") get(msgID, info, responseData);
    else if (func == "post") post(msgID, info, responseData);
    else if (func == "download") download(msgID, info, responseData);
};


void SK_VB_Web::createProgressCallback(String msgID, var info, String& responseData) {

}

void SK_VB_Web::getProgress(String msgID, var info, String& responseData) {

}




void SK_VB_Web::get(String msgID, var info, String& responseData) {

}

void SK_VB_Web::post(String msgID, var info, String& responseData) {
    request(msgID, info, responseData);
}


void SK_VB_Web::download(String msgID, var info, String& responseData) {

}