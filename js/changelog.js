/**************************************************************************
 *                      CHANGELOG LOADING AND HIDING                      *
 **************************************************************************/
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
            $('#changelogModal').css('left', '10%');
        })
        .catch((error) => {
            $('#changelogContent').html("Failed to load changelog.");
            console.error
                ("There was a problem with the fetch operation:", error);
            $('#changelogModal').css('left', '10%');
        });
    $("#darkener").toggleClass("visible-darkener");
}

function hideChangelogModal() {
    $('#changelogModal').css('left', '-500%');
    if (!$("#hamburger-button").hasClass("active")) 
    { $("#darkener").removeClass("visible-darkener"); }
}
