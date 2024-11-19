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
            $('#changelogModal').addClass('changelog-visible');
        })
        .catch((error) => {
            $('#changelogContent').html("Failed to load changelog.");
            console.error
                ("There was a problem with the fetch operation:", error);
            $('#changelogModal').addClass('changelog-visible');
        });
    $("#darkener").toggleClass("visible-darkener");
}

/**
 * Hides the changelog modal from visibility.
 */
function hideChangelogModal() {
    setCookie(Config.cookieName, true);
    $('#changelogModal').removeClass('changelog-visible');
    if ($("#hamburger-button").hasClass("active")) { return; }
    $("#darkener").removeClass("visible-darkener");
}