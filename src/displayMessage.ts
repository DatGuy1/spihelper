/**
 * The old mw.util.jsMessage function before https://gerrit.wikimedia.org/r/#/c/17605/, which
 * introduced the silly auto-hide function. Also with the original styles.
 * Add a little box at the top of the screen to inform the user of
 * something, replacing any previous message.
 * Calling with no arguments, with an empty string or null will hide the message
 *
 * @param message {any} The DOM-element, jQuery object or HTML-string to be put inside the message box.
 * @param className {String} Used in adding a class; should be different for each call
 * to allow CSS/JS to hide different boxes. null = no class used.
 * @return {Boolean} True on success, false on failure.
 */
export function displayMessage(message: Element | string, className?: string): boolean {
    if (!arguments.length || message === '' || message === null) {
        $('#display-message').empty().hide();
        return true; // Emptying and hiding message is intended behaviour, return true
    } else {
        // We special-case skin structures provided by the software. Skins that
        // choose to abandon or significantly modify our formatting can just define
        // a mw-js-message div to start with.
        let $messageDiv = $('#display-message');
        if (!$messageDiv.length) {
            // noinspection CssUnresolvedCustomProperty
            $messageDiv = $('<div id="display-message" style="margin:1em;padding:0.5em 2.5%;border:solid 1px var(--border-color-interactive, #ddd);background-color:var(--background-color-interactive, #fcfcfc);font-size: 0.8em"></div>');
            if (mw.util.$content.length) {
                mw.util.$content.prepend($messageDiv);
            } else {
                return false;
            }
        }
        if (className) {
            $messageDiv.prop('class', 'display-message-' + className);
        }
        if (typeof message === 'object') {
            $messageDiv.empty();
            $messageDiv.append(message);
        } else {
            $messageDiv.html(message);
        }
        $messageDiv.slideDown();
        return true;
    }
}
