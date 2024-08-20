#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_web.h"

using namespace std::chrono;

SK_VB_Web::SK_VB_Web(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}





void SK_VB_Web::request(String msgID, var info, String& responseData) {
    vbe->sk_c_api->curl.createRequest("https://localhost/login_p", "POST");
    return;
    juce::URL url("https://localhost/login_p");

    // Create a JSON string
    juce::String jsonData = "hello world";
    url.withPOSTData(jsonData);

    // Set headers
    juce::String headers = "Content-Type: application/json";


    juce::StringPairArray responseHeaders;
    int statusCode = 0;

    // Make the POST request
    std::unique_ptr<juce::InputStream> inputStream(url.createInputStream(
        true,        // usePostCommand
        nullptr,     // progressCallback
        nullptr,     // progressCallbackContext
        {""},     // extraHeaders
        7000,           // connectionTimeOutMs
        &responseHeaders,     // responseHeaders
        &statusCode,      // statusCode
        5,
        "POST"
    ));

    if (inputStream != nullptr)
    {
        juce::String response = inputStream->readEntireStreamAsString();
        juce::Logger::writeToLog("Response: " + response);
    }
    else
    {
        juce::Logger::writeToLog("Failed to connect to the server!");
    }
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