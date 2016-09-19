/**
 * This ensures the default click action is prevented and the on blur event is
 * properly fired so links and buttons don't stay continuously active.
 */
export default function handleClick(handler: (event) => any) {
    return (event) => {
        event.preventDefault();

        handler(event);

        event.target.blur();
    };
}
