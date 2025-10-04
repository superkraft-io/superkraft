var sk_communicator = {
    send: opt => {
        return window.sk.ipc.ipc.request('sk_be', opt)
    }
}
q