var sk_communicator = {
    send: opt => {
        return sk_api.ipc.request('sk.sb.ipc', opt)
    }
}
