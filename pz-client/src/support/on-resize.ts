interface IResizeEventHandlerCanceller {
    (): void
}

export default function onResize(onResizeHandler: Function): IResizeEventHandlerCanceller {
    let animationFrameHandler = null;

    const resizeEventHandler = () => {
        if (animationFrameHandler) {
            return;
        }

        animationFrameHandler = window.requestAnimationFrame(() => {
            animationFrameHandler = null;
            onResizeHandler();
        })
    };

    window.addEventListener('resize', resizeEventHandler, false);

    return () => window.removeEventListener('resize', resizeEventHandler);
}
