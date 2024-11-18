/**************************************************************************/
/*                      CHANGELOG LOADING AND HIDING                      */
/**************************************************************************/
/**
 * Fetching the changelog file data to show on a modal.
 */
function showChangelogModal() {
    const baseURL = window.location.origin + 
        window.location.pathname.replace(/\/[^/]*$/, '');
    fetch(`${baseURL}/changelog.html`, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok.");
            return response.text();
        })
        .then((data) => {
            $('#changelogContent').html(data);
            $('#changelogModal').css('top', '3%');
        })
        .catch((error) => {
            $('#changelogContent').html("Failed to load changelog.");
            console.error
                ("There was a problem with the fetch operation:", error);
            $('#changelogModal').css('top', '3%');
        });
    $("#darkener").toggleClass("visible-darkener");
}

/**
 * Hides the changelog modal from visibility.
 */
function hideChangelogModal() {
    setCookie(Config.cookieName, true);
    $('#changelogModal').css('top', '-500%');
    if ($("#hamburger-button").hasClass("active")) { return; }
    $("#darkener").removeClass("visible-darkener");
}