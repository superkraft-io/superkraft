//WIP

class SK_UI_Transitions {
    static scale(target, direction = 'in', speed = 200){
        return new Promise(async resolve => {
            clearTimeout(target.__transitionTImer)


            target.style.transition = 'transform ' + speed + 'ms ease-in-out'
            target.style.transform = 'scale(' + (direction === 'in' ? 0.8 : 1) + ')'
            
            target.__transitionTImer = setTimeout(() => {
                target.style.transition = ''
                target.style.transform = ''

                resolve()
            }, speed + 1)
        })
    }
}