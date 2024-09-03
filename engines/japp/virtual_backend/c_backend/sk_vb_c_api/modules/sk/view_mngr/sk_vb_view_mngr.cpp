#pragma once

#include "sk_vb_view_mngr.h"

#include "sk_vb_view/sk_vb_view.hxx"


#include "../../../../sk_vbe/sk_vbe.hxx"
class SK_VirtualBackend;


#include "../../../../../../../../../../src/Editor.hxx"
class SK_Compatible_Editor;

SK_VB_View_Mngr::SK_VB_View_Mngr(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}
SK_VB_View_Mngr::~SK_VB_View_Mngr()
{
    for (int i = 0; i < views.size(); i++)
        delete views[i];
}

void SK_VB_View_Mngr::resizeViews(int width, int height) {
    int offset = 0;
    if (vbe->mode == "debug") offset = 16;
    
    for (int i = 0; i < views.size(); i++) {
        auto* view = views[i];
        view->setTopLeftPosition(offset, 0);
        view->setSize(width - offset, height);
    }
}

SK_VB_ViewMngr_View* SK_VB_View_Mngr::findViewByID(String viewID) {
    for (int i = 0; i < views.size(); i++) {
        auto* view = views[i];
        if (view->id == viewID) return view;
    }

    return nullptr;
}

void SK_VB_View_Mngr::handle_IPC_Msg(String msgID, DynamicObject * obj, String& responseData) {
    var reqInfo = obj->getProperty("data");

    String action = reqInfo.getProperty("action", "");


    if (action == "createView") createView(msgID, reqInfo, responseData);
};

void SK_VB_View_Mngr::createView(String msgID, var obj, String& responseData) {
    var info = obj.getProperty("info", "");


    String viewID = info.getProperty("id", "");

    SK_VB_ViewMngr_View* existingView = findViewByID(viewID);
    String indexPath = info.getProperty("path", "N/A");

    if (existingView != nullptr) {
        String fullPath = juce::WebBrowserComponent::getResourceProviderRoot() + indexPath;
        existingView->goToURL(fullPath);

        return;
    }


    int width = info.getProperty("width", 720);
    int height = info.getProperty("height", 480);

    int minWidth = info.getProperty("minWidth", -1);
    int minHeight = info.getProperty("minHeight", -1);

    int maxWidth = info.getProperty("maxWidth", -1);
    int maxHeight = info.getProperty("maxHeight", -1);

    String iconPath = info.getProperty("icon", "N/A");

    bool maximizable = info.getProperty("maximizable", true);
    bool minimizable = info.getProperty("minimizable", true);


    bool sameWindow = info.getProperty("sameWindow", false);

    /*
    frameless: true
    headless: false
    height: 480
    icon: "/superkraft/engines/japp/app/assets/img/icon.png"
    index: 5
    maximizable: true
    minHeight: 580
    minimizable: true
    path: "/sk_project/views/first_view/frontend/view.html"
    sameWindow: true
    title: "SK JUCE"
    webPreferences: {nodeIntegration: true, contextIsolation : false, enableRemoteModule : true}
    width: 640
    */

    
    if (sameWindow){
        
        SK_VB_ViewMngr_View* view = new SK_VB_ViewMngr_View({
            juce::WebBrowserComponent::Options{}
                .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
                .withWinWebView2Options(
                    juce::WebBrowserComponent::Options::WinWebView2{}.withUserDataFolder(
                        juce::File::getSpecialLocation(juce::File::SpecialLocationType::tempDirectory)
                    )
                )
                .withNativeIntegrationEnabled()
                .withResourceProvider([this](const String& url) {
                    String viewID = url.replace("/sk_vfs/sk_project/views/", "");
                    viewID = viewID.substring(0, viewID.indexOf("/"));

                    auto view = findViewByID("first_view");
                    auto res = vbe->sk_c_api->router.lookUpResource(url, "first_view");
                    return res;
                })
                .withEventListener("sk.ipc", [this](const auto& object) {
                    DynamicObject* obj = object.getDynamicObject();
                    vbe->sk_c_api->ipc->handle_IPC_Msg(obj);
                })
        });

        view->vbe = vbe;


        views.push_back(view);

        //SK_View* view = views.at(views.size() - 1);
        
        view->id = String(viewID);



        String fullPath = juce::WebBrowserComponent::getResourceProviderRoot();// +indexPath;
        view->goToURL(fullPath);

        juce::Timer::callAfterDelay(10000, [this]() {
            //String fullPath = juce::WebBrowserComponent::getResourceProviderRoot();// +indexPath;
            //view->goToURL(fullPath);
        });
        
        vbe->getParentComponent()->addAndMakeVisible(view);
        
        
        vbe->getParentComponent()->setSize(width, height);
        
        
        
        view->setSize(0, 0);
        //view->setAlpha(0.0f);
        view->setColour(juce::ResizableWindow::backgroundColourId, juce::Colours::black);
        
        
        resizeViews(vbe->editor->getWidth(), vbe->editor->getHeight());
        
        vbe->toFront(false);
        
        if (vbe->editor->overlayComponent == nullptr){
            vbe->editor->overlayComponent = new BackgroundOverlayComponent();
            vbe->editor->addAndMakeVisible(vbe->editor->overlayComponent, 999);
            vbe->editor->overlayComponent->setBounds(0, 0, vbe->editor->getWidth(), vbe->editor->getHeight());
            vbe->editor->overlayComponent->toFront(false);
            //view->toBack();
        }
        
        juce::Timer::callAfterDelay(3000, [this, view]() {
            return;
            auto view = findViewByID("first_view");
            //view->setAlpha(1.0f);
            resizeViews(vbe->editor->getWidth(), vbe->editor->getHeight());
        });
    }


    responseData = SK_IPC::OK;
}
