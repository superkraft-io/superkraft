{
    "targets": [
        {
            "target_name": "sk_dapp_pinch",
            "conditions": [
                ["OS=='mac'", {
                    "sources": ["src/sk_dapp_pinch.mm"],
                    "defines": ["NAPI_VERSION=8"],
                    "xcode_settings": {
                        "CLANG_ENABLE_OBJC_ARC": "YES",
                        "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
                        "MACOSX_DEPLOYMENT_TARGET": "11.0"
                    },
                    "link_settings": {
                        "libraries": ["-framework AppKit"]
                    }
                }]
            ]
        }
    ]
}
