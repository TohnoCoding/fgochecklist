//#region DATA HANDLING & STORAGE
/*****************************************************************************/
/*                          DATA HANDLING & STORAGE                          */
/*****************************************************************************/
/**
 * Performs the requested operation on all units of a specified group. Deletes
 * or marks as owned all units in the group based on markAsDeleted.
 * @param {boolean} markAsDeleted Determines if units are deleted or added.
 * @param {string} in_rarity The rarity of units to operate on.
 * @param {string} in_class The class within the rarity to operate on.
 */
function executeActionOnAllUnits
    (markAsDeleted, in_rarity, in_class, is_wishlisting = false) {
    $('#loadingModal').modal('show');
    $.ajax({
        url: Config.datapath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend(xhr) {
            if (xhr.overrideMimeType)
            { xhr.overrideMimeType("application/json"); }
        },
        success(result) {
            const servants_data = result;
            // Determine if specific rarity/class filtering is needed
            if (in_rarity && in_class) {
                Config.jump_to_target = `${in_rarity}_${in_class}`;
                const filteredServants =
                    filterServants(servants_data, in_rarity, in_class);
                applyOperationToServants
                    (filteredServants, markAsDeleted, is_wishlisting);
            } else {
                // Apply operation to all units in all rarities
                servants_data.forEach(rarity => {
                    applyOperationToServants
                        (rarity.list, markAsDeleted, is_wishlisting);
                });
            }
            Config.encoded_user_input = null;
            finishLoading(result);
        },
        error() {
            showAlert("Error attempting to select all data!");
            $('#loadingModal').modal('hide');
        }
    });
}

/**
 * Fetches data stored about the currently selected unit. If none, returns
 * null.
 * @param {string} id The ID of the currently selected unit.
 * @returns {object} Undefined if there's no stored data; the saved data of the
 *                   selected unit if there is.
 */
function getStoredUnitData(id) {
    if (typeof Config.user_data[id] === "undefined") { return null; }
    return Config.user_data[id];
}

/**
 * Saves the currently selected data to localStorage.
 */
function saveLocalData() {
    updateURL(); // Update URL First
    if (Config.compress_input == null || Config.compress_input == "") {
        showAlert("There is nothing to save.");
        return; // Confirm compress_input not null, exit if so
    }
    showConfirmationModal(Config.save_text, function (result) {
        if (result) {
            localStorage[Config.list_local] = Config.compress_input;
            showAlert(Config.save_fin_text, null);
        }
    });
}

/**
 * If data exists in the browser localStorage, confirms with the user whether
 * it should be loaded or ignored.
 */
function loadLocalData() {
    showConfirmationModal(Config.load_text, function (result) {
        if (result) {
            $('#loadingModal').modal('show'); // Show loading modal
            decodeAndProcessData
                (localStorage[Config.list_local]); // Load list
        } else {
            if (Config.encoded_user_input == null) {
                Config.encoded_user_input = ""; // Blank out raw input
            }
        }
    });
    finishLoading();
}

/**
 * Clears all selected data.
 */
function clearAllData() {
    showConfirmationModal(Config.member_clear_conf, function (result) {
        if (result) {
            Config.user_data = {}; // Clear user data
            Config.compress_input = ""; // Clear raw input
            Config.encoded_user_input = ""; // Clear raw input
            finishLoading();
        }
    });
}

/**
 * Removes the specified unit from local storage.
 * @param {string} id The ID of the unit to remove.
 */
function executeUserDataRemoval(id) { delete Config.user_data[id]; }

/**
 * Exports the current data to a downloadable file.
 */
function exportCurrentDataToFile() {
    var blob = new
        Blob([Config.export_header + Config.export_header_separator +
            Config.compress_input], { type: "text/plain;charset=utf-8" });
    saveAs(blob, Config.export_filename);
}

/**
 * Confirms the removal of the currently selected unit.
 */
function removeUserData() {
    if (Config.current_edit == "" || Config.current_edit_ele == null)
        { return; } // Prevent Blank Key
    showConfirmationModal(Config.member_uncheck_conf, function (result) {
        if (result) {
            var current_user_data =
                getStoredUnitData(Config.current_edit); // Get user data
            if (current_user_data != null)
                { executeUserDataRemoval(Config.current_edit); } // Delete data
            $(`#${Config.current_edit}`)  // Update element
                .removeClass(Config.member_owned_CSSclass);
            $(`#${Config.current_edit}`)  // Update element
                .removeClass(Config.member_wishlist_CSSclass);
            updateBadgeInUI  // Update list value
                (Config.current_edit, 0, Config.current_edit_ele);
            updateBadgeInUI
                (Config.current_edit, 0, Config.current_edit_ele, true);
            $('#updateModal').modal('hide'); // Hide update check modal
            updateStatisticsHTML();
            updateURL();
            Config.current_edit = ""; // Clear current_edit
        }
    });
}

/**
 * Reads the uploaded file data and overwrites the currently displayed data.
 */
function loadUploadedFileData() {
    var input = document.getElementById(Config.file_hidden_id);
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function() {
            var fileContents = reader.result;
            var isValid = fileContents
                .startsWith(Config.export_header +
                    Config.export_header_separator);
            if (isValid) {
                var decompressedData = fileContents.replace
                    (Config.export_header +
                        Config.export_header_separator, "");
                return decodeAndProcessData(decompressedData);
            } else { return showAlert(Config.load_fail_text); } // Alert
        }
        reader.readAsText(input.files[0]);
    }
}

/**
 * Loads the data stored in localstorage and expands its contents to display in
 * the UI.
 * @param {string} getresult The locally saved data.
 */
function decodeAndProcessData(getresult) {
    // Clear User Data
    Config.user_data = {};
    Config.compress_input = "";
    Config.encoded_user_input = "";
    Config.compress_input = getresult;      // Get Value
    if (!Config.compress_input || Config.compress_input.trim() === "")
    { Config.compress_input = null; return showAlert(Config.load_fail_text); }
    Config.encoded_user_input =         // Get Raw
        LZString.decompressFromEncodedURIComponent(Config.compress_input);
    // Error; Stop
    if (!Config.encoded_user_input ||
            Config.encoded_user_input.trim() === "") {
        Config.encoded_user_input = null;
        showAlert(Config.load_fail_text);
        return;
    }
    // Ensure backwards compatibility
    Config.encoded_user_input.split(",").forEach(entry => {
        const [id, data] = entry.split(">");
        if (id && data) {
            var [np, wl] = data.split(":").map(Number);
            if (!data.includes(":")) {  // Legacy format: convert
                np = parseInt(data); wl = 0;
                if (np > 5) { wl = np - 5; np = 0; }
            }
            Config.user_data[id] = { np: np || 0, wl: wl || 0 };
        }
    });
    sanitizeStaleMashData(); // Remove previously existing Mash entry
    finishLoading(); // Update HTML
    showAlert(Config.load_fin_text); // Alert
}
//#endregion

//#region URL & STATE UPDATES
/*****************************************************************************/
/*                            URL & STATE UPDATES                            */
/*****************************************************************************/
/**
 * Updates the URL each time a unit's data is changed to reflect the new
 * collection status.
 */
function updateURL() {
    // Sort keys and update raw input
    Config.user_data = orderKeys(Config.user_data);
    Config.encoded_user_input =
        serializeCurrentDataForURLOutput(Config.user_data);
    var new_parameter = ""; // Initialize new parameter
    // Compress user data and update buttons
    if (Config.encoded_user_input) {
        Config.compress_input =
            LZString.compressToEncodedURIComponent(Config.encoded_user_input);
        new_parameter = 
            `?${Config.compress_input_parameter}=${Config.compress_input}`;
        $('#' + Config.save_btn).prop('disabled', false);
        $('#' + Config.save_file_btn).prop('disabled', false);
    } else {
        Config.compress_input = null;
        $('#' + Config.save_btn).prop('disabled', true);
        $('#' + Config.save_file_btn).prop('disabled', true);
    }
    // Add additional parameters
    [getClassModeURLstring(), getFastModeURLstring(),
        getNAonlyURLstring()].forEach((param) => {
        if (param)
        { new_parameter += (new_parameter.includes("?") ? "&" : "?") + param; }
    });
    // Update URL
    const newurl = `${window.location.protocol}//${window.location.host}` +
        `${window.location.pathname}${new_parameter}`;
    window.history.pushState({ path: newurl }, '', newurl);
}

/**
 * Updates the URL to include the various URL options (namely,
 * Class/Fast Modes being toggled).
 */
function updateURLOptionModeOnly() {
    const urlParams = new URLSearchParams(window.location.search);
    const options = [
        { key: Config.classmode_parameter, value:
            getClassModeURLstring(), storageKey: Config.class_mode_local },
        { key: Config.fastmode_parameter, value:
            getFastModeURLstring(), storageKey: Config.fast_mode_local },
        { key: Config.NAonly_parameter, value:
            getNAonlyURLstring(), storageKey: Config.NAonly_local }
    ];
    options.forEach(({ key, value, storageKey }) => {
        if (value) { urlParams.set(key, 1); localStorage[storageKey] = 1; }
        else { urlParams.delete(key); localStorage[storageKey] = 0; }
    });
    const newUrl = `${window.location.protocol}//${window.location.host}` +
        `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}
//#endregion

//#region UI MANIPULATION & DISPLAY
/*****************************************************************************/
/*                         UI MANIPULATION & DISPLAY                         */
/*****************************************************************************/
/**
 * Rebuilds the UI whenever any of the app toggles is triggered.
 */
function rebuildUI() { updateURLOptionModeOnly(); finishLoading(); }

/**
 * If the date is within the appropriate range (set to between November 28th
 * and January 3rd by default in the config file), inject the holiday
 * Padoru CSS.
 */
function checkDateToInjectPadoru() {
    const today = new Date();
    const currMonth = today.getMonth(), currDay = today.getDate();
    if ((currMonth < Config.padoruStartMonth ||
        (currMonth === Config.padoruStartMonth &&
            currDay < Config.padoruStartDay))
        || (currMonth === Config.padoruEndMonth &&
            currDay > Config.padoruEndDay))
        { return; } // Do nothing if outside the above date range
    $('head').append($('<link>', {
        rel: "stylesheet",
        type: "text/css",
        href: "./css/padoruSite.css",
        crossorigin: "anonymous"
    }));
    $("#walk-container").append($('<img>', {
        class: "d-inline-block align-top",
        id: "padoru-walker"
    }));
    const randomPadoru = "./img/padoru/" + Config.padorus
        [Math.floor(Math.random() * Config.padorus.length)];
    $("#padoru-walker").attr('src', randomPadoru);
    var $snowfall = $('<div>', { class: 'snowfall', id: 'snowfall' });
    var $pageBody = $('body').contents().detach();
    $('body').empty().append($snowfall.append($pageBody));
}

/**
 * Builds the completed UI with amount of copies for all characters.
 * @param {object} units_data The currently saved list data.
 */
function buildUnitDataInUI(units_data) {
    $('[data-toggle="tooltip-member"]').tooltip('dispose'); // Clear tooltip
    $(".listbox, .listbox_class").empty(); // Clear contents
    var list_box = [], list_img = [];
    var img_default =
        getPortraitImagePath(Config.icondefault,
            Config.icondefault_external_source);
    list_img.push(loadSprite(img_default)); // Add default photo
    units_data.forEach(function(cur_rarity) {
        if (cur_rarity.disable) { return; } // Skip if disabled
        var curr_element = `#${cur_rarity.list_element}`;
        list_box.push(curr_element);
        if (isClassMode()) {
            var class_html_wrapper = $("<div>");
            cur_rarity.class_available.forEach(function(cur_class) {
                // Create the class container
                var class_container = $('<div>', { 
                    class: 'row classBox', 
                    id: `${cur_rarity.list_id}_${cur_class}` 
                });
                // Class Icon
                var current_class_data = Config.class_data_list[cur_class];
                var current_class_data_icn = getClassImagePath
                    (current_class_data.iconlist[cur_rarity.list_id]);
                list_img.push(loadSprite(current_class_data_icn));
                var class_icon_div = $('<div>', {
                    class: Config.class_div_icon_CSSclass,
                    style: 'text-align: center'
                }).append(
                    $('<img>', {
                        src: current_class_data_icn,
                        class: Config.img_CSSclass,
                        title: current_class_data.name,
                        'data-toggle': 'tooltip-member',
                        'data-placement': 'bottom'
                    })
                );
                class_icon_div.append(   // Count display
                    `<span id="${Config.class_count_have}` +
                    `${cur_rarity.list_id}_${cur_class}">0</span>/` +
                    `<span id="${Config.class_count_max}` +
                    `${cur_rarity.list_id}` +
                    `_${cur_class}">0</span><br>`
                );
                class_icon_div.append(   // Own All + WL All + None Buttons
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-outline-primary btn-xs',
                        text: 'Own All'
                    }).on('click', function() { promptActionOnAllUnits
                        (false, cur_rarity.list_id, cur_class); } ),
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-outline-success btn-xs',
                        text: 'WL All'
                    }).on('click', function() { promptActionOnAllUnits
                        (false, cur_rarity.list_id, cur_class, true); } ),
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-outline-danger btn-xs',
                        text: 'None'
                    }).on('click', function() { promptActionOnAllUnits
                        (true, cur_rarity.list_id, cur_class); } )
                );
                class_container.append(class_icon_div);
                class_container.append($('<div>', {   // Add row for the class
                    class: `row ${Config.class_div_list_CSSclass} classRow`,
                    id: `${cur_rarity.list_element}_${cur_class}`
                }));
                class_html_wrapper.append(class_container).append('<hr>');
            });
            $(`${curr_element}-${Config.class_divide_CSSclass}`)
                .html(class_html_wrapper);
        }
        cur_rarity.list.forEach(function(current_servant) {
            if (isNAonly() && current_servant.game_id > Config.globalThreshold)
                { return; }     // Exit if filtering to NA-only
            // Store unit data globally for other uses
            Config.servants_data_list[current_servant.id] = current_servant;
            Config.servants_data_list[current_servant.id].key =
                cur_rarity.list_id;
            Config.servants_data_list[current_servant.id].class =
                current_servant.class;
            Config.servants_data_list[current_servant.id].eventonly =
                Config.servant_typelist[current_servant.stype].eventonly;
            // Retrieve user data with default values for `np` and `wl`
            var current_user_data =
                getStoredUnitData(current_servant.id) || { np: 0, wl: 0 };
            var ownedLevel = !isNaN(current_user_data.np)
                && current_user_data.np != null ?
                    current_user_data.np : 0;
            var wishlistLevel = !isNaN(current_user_data.wl)
                && current_user_data.wl != null ?
                    current_user_data.wl : 0;
            var unit_container = $('<div>', // Define the main unit container
                { class: Config.member_grid_CSSclass }).append(
                $('<div>', {
                    id: current_servant.id,
                    title: current_servant.name,
                    class: Config.member_container_CSSclass + 
                        (ownedLevel > 0 ? 
                            ` ${Config.member_owned_CSSclass}` : "") +
                        (wishlistLevel > 0 ?
                            ` ${Config.member_wishlist_CSSclass}` : ""),
                    'data-toggle': 'tooltip-member',
                    'data-placement': 'bottom'
                })
            );
            var current_servant_img = img_default;
            if (current_servant.img) {
                current_servant_img = current_servant.imgpath
                    ? getPortraitImagePath(current_servant.imgpath, true)
                    : getPortraitImagePath(`${cur_rarity.list_iconpath}/` +
                        `${current_servant.id}${Config.icontype}`, false);
            }
            list_img.push(loadSprite(current_servant_img))
            // Retrieve badges directly from configuration
            var npBadge = Config.copy_choice_allow[ownedLevel].badge;
            var wlBadge = Config.wishlist_choice_allow[wishlistLevel].badge;
            // Append main image and NP/Wishlist badges to the unit container
            unit_container.find('div').append(
                $('<img>',
                    { src: current_servant_img, class: Config.img_CSSclass }
                ),
                $('<div>', {    // NP copies
                    id: `${Config.additional_copies_prefix}` +
                        `${current_servant.id}`,
                    class: Config.additional_copies_CSSclass,
                    text: npBadge
                }),
                $('<div>', {    // Wishlist copies
                    id: `${Config.wishlist_copies_prefix}` +
                        `${current_servant.id}`,
                    class: `${Config.additional_copies_CSSclass} wl-level`,
                    text: wlBadge
                })
            );
            // Type icon (e.g., limited, story-locked) based on servant type
            var current_type = Config.servant_typelist[current_servant.stype];
            if (current_type.show) {
                unit_container.find('div').first().append(
                    $('<div>', {
                        class: `${Config.servant_type_box_class}` +
                            ` ${current_type.class}`,
                        html: current_type.typeicon // Icon content
                    })
                );
            }
            // Append unit_container to correct class container
            if (isClassMode()) {
                $(`${curr_element}_${current_servant.class}`)
                    .append(unit_container);
            } else { $(curr_element).append(unit_container); }
            // Event handler unbinding and rebinding
            unit_container.off('click contextmenu'); // Unbind event handlers
            const event_listener_element = unit_container
                .find(`.${Config.member_container_CSSclass}`).first();
            unit_container.on('click', function() {
                elementLeftClick(event_listener_element);
            });
            unit_container.on('contextmenu', function(e) {
                e.preventDefault();
                elementRightClick(event_listener_element);
            });
        });
    });
    $(".classRow").each(function() { // Remove empty/unreleased classes
        const hrs = $(this).parent().parent().find("hr");
        if ($(this).children().length === 0) {
            $(this).parent().remove();
            hrs.eq(-1).remove();
        }
    });
    $.when.apply(null, list_img).done(function() {
        list_box.forEach(function(current_box) {
            $(`${current_box}${Config.box_fake_suffix}`).hide();
            if (isClassMode()) {
                $(current_box).hide();
                $(`${current_box}-${Config.class_divide_CSSclass}`).show();
            } else {
                $(`${current_box}-${Config.class_divide_CSSclass}`).hide();
                $(current_box).show();
            }
        });
        updateStatisticsHTML();
        $("#" + Config.statistic_area).show();
        $('[data-toggle="tooltip-member"]').tooltip();
        $('#loadingModal').modal('hide');
        jumpTo();
    });
}

/**
 * Updates the statistics section of the displayed page based on displayed
 * selected data. Calculations now work based on rendered page elements
 * instead of locally saved data in order to be able to recalculate whenever
 * units unreleased in NA are hidden.
 */
function updateStatisticsHTML() {
    const classMap = new Map([
        ["ssrBox", "5★"], ["srBox", "4★"], ["rareBox", "3★"],
        ["uncommonBox", "2★"], ["commonBox", "1★"], ["noneBox", "0✩"]
    ]);
    var overallTotal = 0, overallOwned = 0,
        overallNotEventTotal = 0, overallNotEventOwned = 0;
    var elementToSearch = isClassMode() ? ".listbox_class" : ".row.listbox";
    $(elementToSearch).each(function() {
        var $container = $(this);
        var boxType = $container.attr('id').replace("-ByClass", "");
        var $members = $container.find(`.${Config.member_container_CSSclass}`);
        var totalUnits = $members.length;
        var ownedUnits =
            $members.filter(`.${Config.member_owned_CSSclass}`).length;
        var $notEventUnits = $members.filter(function() {
            return !$(this).find('.member-eventonly').length;
        });
        var totalNotEventUnits = $notEventUnits.length;
        var ownedNotEventUnits =
            $notEventUnits.filter(`.${Config.member_owned_CSSclass}`).length;
        overallTotal += totalUnits;
        overallOwned += ownedUnits;
        overallNotEventTotal += totalNotEventUnits;
        overallNotEventOwned += ownedNotEventUnits;
        var percentageOwned = (ownedUnits / totalUnits * 100).toFixed(2);
        var percentageNotEventOwned =
            (ownedNotEventUnits / totalNotEventUnits * 100).toFixed(2);
        $("#" + boxType + "AllStats")
            .text(`${classMap.get(boxType)}: ${percentageOwned}% ` +
            `(${ownedUnits}/${totalUnits})`);
        $("#" + boxType + "NotEventStats").text(`${classMap.get(boxType)}: ` +
            `${percentageNotEventOwned}% ` +
            `(${ownedNotEventUnits}/${totalNotEventUnits})`);
        if (isClassMode()) { // Update class-specific stats if in class mode
            $(".classBox .classRow").each(function() {
                var classTotal = $(this)
                    .find($(`.${Config.member_container_CSSclass}`)).length;
                var classOwned = $(this)
                    .find($(`.${Config.member_owned_CSSclass}`)).length;
                var partialCounterDivID =
                    $(this).parent().prop("id").replace("Box", "");
                $("#class_have_" + partialCounterDivID).text(classOwned);
                $("#class_max_" + partialCounterDivID).text(classTotal);
            });
        }
    });
    var overallPercent = ((overallOwned / overallTotal) * 100).toFixed(2);
    var overallNotEventPercent =
        ((overallNotEventOwned / overallNotEventTotal) * 100).toFixed(2);
    $("#statisticBoxAllPercent").text(overallPercent);
    $("#statisticBoxAllHave").text(overallOwned);
    $("#statisticBoxAllMax").text(overallTotal);
    $("#statisticBoxNotEventPercent").text(overallNotEventPercent);
    $("#statisticBoxNotEventHave").text(overallNotEventOwned);
    $("#statisticBoxNotEventMax").text(overallNotEventTotal);
}

/**
 * Updates the amount of copies owned by the specified value.
 * @param {string} id The ID of the unit to update.
 * @param {number} new_val The new amount of copies owned.
 * @param {string} s_element The target DOM element.
 */
function updateBadgeInUI(id, level, element, isWishlist = false) {
    if (!id) { return; }
    const prefix = isWishlist ? 
        Config.wishlist_copies_prefix : Config.additional_copies_prefix;
    const choiceList = isWishlist ? 
        Config.wishlist_choice_allow : Config.copy_choice_allow;
    const content = level > 0 ? choiceList[level]?.badge || "" : "";
    $(element).find(`#${prefix}${id}`).html(content);
}

/**
 * Finishes the UI setup process once all data has been handled.
 * @param {object} servant_pass_data The data to display.
 */
function finishLoading(servant_pass_data) {
    // Clear Contents
    $(".listbox").hide();
    $(".listbox_class").hide();
    $(".listbox_fake").show();
    // Convert User Data from Input
    if (Config.encoded_user_input !== null) {
        var array_input = Config.encoded_user_input.split(",");
        for (var ii = 0, li = array_input.length; ii < li; ii++) {
            var current_split = array_input[ii].split(">");
            if (current_split[0] != "" && current_split[1] != "") {
                var servantId = current_split[0], np = 0, wl = 0;
                var storedValue = current_split[1].split(":");
                if (storedValue.length > 1) { // New format: "np:wl"
                    np = parseInt(storedValue[0], 10) || 0;
                    wl = parseInt(storedValue[1], 10) || 0;
                    if (np < 0 || np > 5) { np = 0; }
                    if (wl < 0 || wl > 9) { wl = 0; }
                } else { // Legacy format: single value "storedValue"
                    var legacyValue = parseInt(storedValue[0], 10);
                    if (!isNaN(legacyValue)) {
                        np = legacyValue <= 5 ? legacyValue : 0;
                        wl = legacyValue > 5 && legacyValue <= 10 ?
                            legacyValue - 5 : 0;
                    }
                }
                Config.user_data[servantId] = { np, wl };
            }
        }
    }
    sanitizeStaleMashData(); // Remove previously existing Mash entry
    updateURL(); // Update URL
    $.ajax({    // Ajax; Class data
        url: Config.dataclasspath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend: function(xhr) { if (xhr.overrideMimeType)
            { xhr.overrideMimeType("application/json"); } },
        success: function(outer_result) {
            Config.class_data_list = outer_result; // Inject class data
            // If Passing
            if (typeof servant_pass_data !== "undefined")
            { buildUnitDataInUI(servant_pass_data); return; } // Construct UI
            // Ajax; Unit data
            $.ajax({
                url: Config.datapath,
                contentType: "application/json",
                dataType: "json",
                cache: false,
                beforeSend: function(xhr) { if (xhr.overrideMimeType)
                    { xhr.overrideMimeType("application/json"); }
                },
                success: function(result) { buildUnitDataInUI(result); },
                error: function(result) {
                    showAlert("Error caching Unit Class Data on AJAX!<br>" +
                        "<br>Please refresh the page to try again."); // Alert
                    $('#loadingModal').modal('hide'); // Close loading modal
                }
            });
        },
        error: function(result) {
            showAlert("Error caching Unit Class Data on AJAX!<br><br>" +
                "Please refresh the page to try again."); // Alert
            $('#loadingModal').modal('hide'); // Close loading modal
        }
    });
    if(isNAonly()) {
        $("#hakunoSpoiler0").css("display", "none");
        $("#hakunoSpoiler1").css("display", "none");
        $("#hakunoSpoiler2").css("display", "none");
        $("#habenyanSpoiler").css("display", "inline");
    } else {
        $("#hakunoSpoiler0").css("display", "inline");
        $("#hakunoSpoiler1").css("display", "inline");
        $("#hakunoSpoiler2").css("display", "inline");
        $("#habenyanSpoiler").css("display", "none");
    }
}
//#endregion

//#region EVENT LISTENERS & INTERACTIVE LOGIC
/*****************************************************************************/
/*                    EVENT LISTENERS & INTERACTIVE LOGIC                    */
/*****************************************************************************/
/**
 * Handles quick updates of units when Fast Mode is activated.
 * @param {string} id The ID of the selected unit.
 * @param {number} val Determines which property to modify
 *                     (1 for NP, -1 for WL).
 * @param {HTMLElement} s_element The HTML element of the selected unit.
 */
function updateUnitDataInFastMode(id, val, s_element) {
    if (!id || !s_element) { return; }
    const current_user_data = getStoredUnitData(id) || { np: 0, wl: 0 };
    const isNPUpdate = val > 0; // Left/short tap for NP, right/long tap for WL
    const maxValue = isNPUpdate
        ? Config.servants_data_list[id].maxcopy
        : Config.wishlist_choice_allow.length - 1;
    if (isNPUpdate)
    { current_user_data.np = (current_user_data.np + 1) % (maxValue + 1); }
    else
    { current_user_data.wl = (current_user_data.wl + 1) % (maxValue + 1); }
    Config.user_data[id] = current_user_data;
    updateBadgeInUI(id, current_user_data.np, s_element); // Owned copies
    updateBadgeInUI(id, current_user_data.wl, s_element, true); // WL copies
    $(s_element).toggleClass( Config.member_owned_CSSclass, 
        current_user_data.np > 0); // Toggle owned class if marking owned
    $(s_element).toggleClass(Config.member_wishlist_CSSclass,
        current_user_data.wl > 0); // Toggle WL class if marking wishlisted
    updateStatisticsHTML();
    updateURL();
}

/**
 * Updates the selected unit's ownership status/level.
 */
function updateUnitData(isAdding) {
    if (Config.current_edit == "" || Config.current_edit_ele == null)
        { return; } // Prevent Blank Key
    const action = isAdding ? "Add" : "Update";
    const owned = Config.member_owned_CSSclass;
    const wish = Config.member_wishlist_CSSclass;
    const id = Config.current_edit;
    const element = Config.current_edit_ele;
    const newNPlevel = parseInt($(`#np${action}`).val());
    const newWLlevel = parseInt($(`#wl${action}`).val());
    if (newNPlevel == 0 && newWLlevel == 0)
    { $(`#${action}`).modal('hide'); return showAlert("No data to save."); }
    Config.user_data[id] = { np: newNPlevel, wl: newWLlevel };
    updateBadgeInUI(id, newNPlevel, element); // Owned copies
    updateBadgeInUI(id, newWLlevel, element, true); // Wishlist copies
    if (newNPlevel != 0) { $(`#${id}`).addClass(owned); }
    else { $(`#${id}`).removeClass(owned); }
    if (newWLlevel != 0) { $(`#${id}`).addClass(wish); }
    else { $(`#${id}`).removeClass(wish); }
    $(`#${action.toLowerCase()}Modal`).modal('hide');
    updateStatisticsHTML();
    updateURL();                // Persist data in URL
    Config.current_edit = "";   // Housekeeping cleanup
}

/**
 * Left click on a given unit's portrait.
 * @param {string} s_element The ID of the unit clicked on.
 */
function elementLeftClick(s_element) {
    var id = $(s_element).attr("id");
    var name = $(s_element).data("original-title");
    if (isFastMode()) { // Fast Mode, change values without modals
        updateUnitDataInFastMode(id, 1, s_element); // Increase owned copies
        return; // Stop
    }
    // Set current edit markers
    Config.current_edit = id;
    Config.current_edit_ele = s_element;
    var current_user_data = getStoredUnitData(id),
        current_edit_max = Config.servants_data_list[id].maxcopy;
    // If data exists, set Update Modal; if not, set Add Modal
    if (current_user_data != null) {
        getNewCopySource(current_edit_max, Config.list_update,
            Config.wishlist_update, id);
        $('#nameUpdate').html(name);
        $('#npUpdate').val(current_user_data.np ||
            Config.copy_choice_default).trigger('change'); 
        $('#wlUpdate').val(current_user_data.wl ||
            Config.wishlist_choice_default).trigger('change'); 
        $('#updateModal').modal('show');
    } else {
        getNewCopySource(current_edit_max, Config.list_new,
            Config.wishlist_new, id);
        $('#nameAdd').html(name);
        $('#npAdd').val(Config.copy_choice_default).trigger('change');
        $('#wlAdd').val(Config.wishlist_choice_default).trigger('change');
        $('#addModal').modal('show');
    }
}

/**
 * Right click on a given unit's portrait.
 * @param {string} s_element The ID of the unit clicked on.
 */
function elementRightClick(s_element) {
    if (!isFastMode()) { return; } // If not Fast Mode, don't do anything
    var id = $(s_element).attr("id");
    updateUnitDataInFastMode(id, -1, s_element); // Mark current_edit
}

/**
 * Prompts the user to operate on all units. If deleting, deletes all units
 * of a given group. If adding, marks all units of a given group at the first
 * level of NP copies.
 * @param {boolean} markAsDeleted Determines whether the operation deletes or
 *                                adds all units.
 * @param {string} input_rarity The desired rarity in which to operate on all
 *                              units.
 * @param {string} input_class The desired class in the desired rarity in
 *                             which to operate on all units.
 */
function promptActionOnAllUnits
    (markAsDeleted, input_rarity, input_class, is_wishlisting) {
    showConfirmationModal(Config.select_all_text, (result) => {
        if (result) { executeActionOnAllUnits
            (markAsDeleted, input_rarity, input_class, is_wishlisting); }
    });
}

/**
 * Triggers the File Open dialog box.
 */
function openFileUploadPrompt()
{ document.getElementById(Config.file_hidden_id).click(); }

/**
 * Toggles the display of the unique icon identifiers for each category of
 * units.
 */
function toggleUnitTypeIcon() 
{ $("." + Config.servant_type_box_class).toggle(); }

/**
 * Requests the shortening of the current URL and shows it to the user. Can
 * additionally open share windows for Xwitter and Facebook if desired. If the
 * URL can't be shortened, shows an error modal notifying the user.
 * @param {string} site "Facebook", "Twitter" (opens new windows for direct
 *                      sharing), or any other string (including an empty
 *                      string) to just get the shortened URL.
 */
function shareURL(site) {
    shortenURL().then((short_url) => {
        if(short_url == undefined) { showURLShorteningError(); return; }
        if (site == "facebook") {
            showShortURLModal(short_url); // Share; show short URL
            window.open("https://www.facebook.com/sharer.php?&u=" +
                short_url,"","menubar=0"); // Share to FB
        } else if (site == "twitter") {
            showShortURLModal(short_url); // Share; show short URL
            window.open("https://twitter.com/intent/tweet?url=" +
                short_url + "&text=" + Config.share_title + "&hashtags=" +
                Config.share_tags,"","menubar=0"); // Share to Xwitter
        } else { showShortURLModal(short_url); }
    });
};

/**
 * Copies the resulting shortened URL to the clipboard.
 */
function copyToClipboard() {
    var copyText = document.querySelector("#link-copy");
    copyText.select();
    copyText.setSelectionRange(0, 99999);  // Mobile-proof
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText.value || copyText.defaultValue)
            .catch(function(err) { console.error('Copy failed: ', err); });
    } else { // Fallback for older browsers and insecure contexts
        try {
            document.execCommand("copy");
            console.log('Fallback: old way of copying to clipboard');
        } catch (err) { console.error('Fallback copy failed', err); }
    }
}
//#endregion

//#region MODALS AND DIALOGS
/*****************************************************************************/
/*                             MODALS AND DIALOGS                            */
/*****************************************************************************/
/**
 * Creates and opens a popup with the shortened URL of the currently active
 * data.
 * @param {string} url The shortened URL.
 */
function showShortURLModal(url) {
    const $formGroup = $('<div>', { class: 'form-group' });
    const $inputGroup = $('<div>', { class: 'input-group mb-3' });
    const $input = $('<input>', {
        type: 'text',
        id: 'link-copy',
        class: 'form-control',
        value: url,
        readonly: true
    });
    const $button = $('<button>', {
        type: 'button',
        class: 'btn btn-outline-secondary',
        text: 'Copy',
        id: 'copy_button'
    })
    const $inputGroupAppend = $('<div>', { class: 'input-group-append' })
        .append($button);
    $inputGroup.append($input).append($inputGroupAppend);
    $formGroup.append($inputGroup);
    var url_dialog = bootbox.dialog({
        message: $('<div>').append(Config.share_text).append('<hr/>')
            .append($formGroup).html()
    });
    url_dialog.init(function() { $('.bootbox').on('click', '#copy_button',
        function() { copyToClipboard('link-copy'); }); });
}

/**
 * Shows a Bootbox confirmation modal with the specified message, and executes
 * the specified function if the dialog box result is a confirmation.
 * @param {string} msg The message to display in the confirmation box.
 * @param {function} onConfirm The callback function to execute on confirm.
 */
function showConfirmationModal(msg, onConfirm) {
    bootbox.confirm({
        message: msg,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function (result) {
            if (result && typeof(onConfirm) === 'function')
                { onConfirm(result); }
        }
    });
}

/**
 * Displays a modal to inform the user that there was an issue with the URL
 * shortening functionality, and that the current URL couldn't be shortened.
 */
function showURLShorteningError() {
    var msg = "There has been an error with the URL shortening functionality" +
        ". Your current data URL couldn'n be shortened.<br><br>More details" +
        " can be found in your browser console.";
    var error_dialog = bootbox.dialog({
        message: msg,
        buttons: { confirm: { label: '<i class="fa fa-check"></i> Ok' } }
    });
    error_dialog.init(function() { });
}

/**
 * Shows an alert modal.
 * @param {string} message The message to display in the alert modal.
 */
function showAlert(message) { bootbox.alert(message, null); }

/**
 * Exports the current data to a downloadable image.
 */
function exportCanvasToImage() {
    var msg = "WARNING: Image result may not look exactly like in the " +
        "page due to capture library limitations.<br/>It is recommendeded" +
        " to share the link or use an external capture tool instead.<br/>" +
        "Continue?";
    showConfirmationModal(msg, function (result) {
        if (result) {
            $('#loadingModal').modal('show'); // Show loading modal
            html2canvas($('#' + Config.capture_area)[0], { useCORS: true })
                .then(function(canvas) {
                    // canvas is the final rendered <canvas> element
                    var alink = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a
                    // jpeg, then convert for file download
                    alink.href = canvas.toDataURL("image/jpeg")
                        .replace("image/jpeg", "image/octet-stream");
                    alink.download = Config.export_filename
                        .replace('_', '-').replace("fgol", "jpg");
                    // Firefox requires the link to be in the body
                    document.body.appendChild(alink);
                    alink.click();
                    document.body.removeChild(alink); // Remove when done
                    $('#loadingModal').modal('hide'); // Close modal
                });
        }
    });
}

/**
 * Prompts the user to save the current data, and to overwrite existing data if
 * needed.
 */
function promptSaveDataExport() {
    updateURL(); // Update URL First
    if (Config.compress_input == null) { return; } // Confirm not null
    showConfirmationModal(Config.save_text, (function(result) { if (result)
        { exportCurrentDataToFile(Config.compress_input); } }));
}
//#endregion

//#region MISCELLANEOUS GETTERS & STATE VERIFICATIONS
/*****************************************************************************/
/*                MISCELLANEOUS GETTERS & STATE VERIFICATIONS                */
/*****************************************************************************/
/**
 * Returns whether Fast Mode is activated.
 * @returns {boolean} True if Fast Mode is on, False otherwise.
 */
function isFastMode()
{ return $('#' + Config.fastmode_checkbox).is(':checked'); }

/**
 * Returns whether Class Mode is activated.
 * @returns {boolean} True if Class Mode is on, False otherwise.
 */
function isClassMode()
{ return $('#' + Config.classmode_checkbox).is(':checked'); }

/**
 * Returns whether JP-only Servants should be hidden.
 * @returns {boolean} True if the hiding checkbox is checked, False otherwise.
 */
function isNAonly()
{ return $('#' + Config.NAonly_checkbox).is(':checked'); }

/**
 * Returns a string indicating the state of Fast Mode for URL injection.
 * @returns {string} An empty string if Fast Mode is off;
 *                   `{$fastmode_parameter}=1` if it's on.
 */
function getFastModeURLstring()
{ return isFastMode() ? Config.fastmode_parameter + "=1" : ""; }

/**
 * Returns a string indicating the state of Class Mode for URL injection.
 * @returns {string} An empty string if Class Mode is off,
 *                   `{$classmode_parameter}=1` if it's on.
 */
function getClassModeURLstring()
{ return isClassMode() ? Config.classmode_parameter + "=1" : ""; }

/**
 * Returns a string indicating whether JP-only units should be hidden.
 * @returns {string} An empty string if "hide JP units" is off;
 *                   `{$NAonly_parameter}=1` if it's on.
 */
function getNAonlyURLstring()
{ return isNAonly() ? `${Config.NAonly_parameter}=1` : ""; }

/**
 * Gets the path to an unit portrait image. Loads a default "unknown" image
 * if the unit json definition data file doesn't include one, or if the `img`
 * property of the current unit is set to false.
 * @param {string} path The path to the image local to the codebase.
 * @param {boolean} external_source Whether the image is from an external
 *                                  source.
 * @returns {string} The full path to the desired image.
 */
function getPortraitImagePath(path, external_source)
{ return getImagePath(path, external_source, true); }

/**
 * Constructs the path to an image, allowing flexible use for specific unit
 * portraits, a generic unit portrait, or class images based on invoking
 * parameters.
 * @param {string} path The path to the image, either an absolute URL
 *                      (depending on external_source) or local to the
 *                      current codebase.
 * @param {boolean} [external_source = false] Specifies whether the image is
 *                  external to the codebase or not.
 * @param {boolean} [isPortrait = false] Specifies whether the image being
 *                  loaded is an unit portrait or not.
 * @returns {string} The fully formed path to the desired image.
 */
function getImagePath(path, external_source = false, isPortrait = false) {
    if (isPortrait && external_source) { return path; }
    const src = isPortrait ? Config.img_path : Config.class_img_path;
    return `${location.href.substring(0,
        location.href.lastIndexOf("/") + 1)}${src}${path}`;
}

/**
 * Gets the path of a class image.
 * @param {string} servantClass The class to get the image for.
 * @returns {string} The full path to the desired class image.
 */
function getClassImagePath(servantClass) { return getImagePath(servantClass); }
//#endregion

//#region UTILITY & HELPER FUNCTIONS
/*****************************************************************************/
/*                         UTILITY & HELPER FUNCTIONS                        */
/*****************************************************************************/
/**
 * Filters servants based on rarity and class.
 * @param {Array} servants_data The full data array of servants.
 * @param {string} rarity The rarity to filter by.
 * @param {string} unitClass The class within the specified rarity.
 * @returns {Array} Filtered array of servants in the specified rarity
 *                  and class.
 */
function filterServants(servants_data, rarity, unitClass) {
    return servants_data
        .find(r => r.list_id === rarity)?.list
        .filter(servant => servant.class === unitClass) || [];
}

/**
 * Applies the specified operation to a list of servants, either marking as
 * owned at first level, wishlisting them at one copy, or deleting them.
 * @param {Array} servants The list of servants to operate on.
 * @param {boolean} markAsDeleted Whether to delete or add the units.
 * @param {boolean} markAsWL Whether to mark units as wishlisted or owned.
 */
function applyOperationToServants(servants, markAsDeleted, markAsWL = false) {
    servants.forEach(servant => {
        if (markAsDeleted) {
            if (Config.user_data[servant.id] !== undefined)
            { executeUserDataRemoval(servant.id); }
        } else {
            if (Config.user_data[servant.id] === undefined) {
                Config.user_data[servant.id] = {
                    np: markAsWL ? 0 : 1,
                    wl: markAsWL ? 1 : 0
                };
            }
        }
    });
}

/**
 * Builds a new Select2 combobox/dropdown for the desired unit for the detailed
 * popup.
 * @param {number} current_max The max amount of copies of the currently
 *                             selected element.
 * @param {object} nplist The list of elements to display in the box.
 */
function getNewCopySource(current_max, nplist, wishlist) {
    var npChoices =
        Config.copy_choice_allow.filter(choice => choice.id <= current_max);
    nplist.data('select2').dataAdapter.updateOptions(npChoices);
    wishlist.prop('disabled', false).data('select2').dataAdapter
        .updateOptions(Config.wishlist_choice_allow.map(option => {
            return { id: option.id, text: option.text };
        }));
    $("#wlAddHelp").text("At what NP level do you wish to have this " +
        "Servant?");
    $("#wlUpdateHelp").text("At what NP level do you wish to have this " +
        "Servant?");
}

/**
 * Gets the value of a cookie with the specified name.
 * @param {string} name The name of the cookie to get.
 * @returns {string} The value of the cookie if it exists; null if it doesn't.
 */
function getCookie(name) {
    var equals = name + "=", i = 0;
    var cookies = document.cookie.split(';');
    for (i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ')
            { cookie = cookie.substring(1, cookie.length); }
        if(cookie.indexOf(equals) == 0)
            { return cookie.substring(equals.length, cookie.length); }
    }
    return null;
}

/**
 * Sets a cookie.
 * @param {string} name The name of the cookie.
 * @param {any} value The desired value of the cookie.
 */
function setCookie(name, value) {
    var date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    var cookie = name + "=" + (value || "") + "; expires=" +
        date.toUTCString() + "; path=/";
    document.cookie = cookie;
}

/**
 * Serializes the current data into an easily compressable string.
 * @param {object} input_data The data to be serialized.
 * @returns {string} A string representation of the current data.
 */
function serializeCurrentDataForURLOutput(input_data) {
    var serialized_input = "", key;
    for (key in input_data) {
        if (input_data.hasOwnProperty(key)) {
            var current_user_data = input_data[key];
            if (current_user_data.np > 5) {
                current_user_data.wl = current_user_data.np - 5;
                current_user_data.np = 0;
            }
            serialized_input += key + ">" + current_user_data.np + ":" +
                current_user_data.wl + ",";
        }
    }
    return serialized_input.slice(0, -1); // Remove trailing comma
}

/**
 * Jumps to a specific point in the viewport.
 */
function jumpTo(){
    if (Config.jump_to_target === null) { return; }
    document.getElementById
        (Config.jump_to_target).scrollIntoView(); // Even IE6 supports this
    Config.jump_to_target = null;
}

/**
 * Takes a key-value pair and sorts the keys alphabetically, then returns the
 * sorted collection.
 * @param {object} not_sorted Unsorted collection of key-value pairs.
 * @returns {object} A new collection of key-value pairs sorted alphabetically
 *                   by the keys.
 */
function orderKeys(not_sorted) {
    var sorted = Object.keys(not_sorted).sort()
        .reduce(function (acc, key) {
            acc[key] = not_sorted[key];
            return acc;
        }, {});
    return sorted;
}

/**
 * Preloads images asynchronously.
 * @param {string} src The address/URL of the image to load.
 * @returns {Promise<void>} A promise that resolves when the image finishes
 *                          loading.
 */
function loadSprite(src) {
    var deferred = $.Deferred();
    var sprite = new Image();
    sprite.onload = function() { deferred.resolve(); };
    sprite.src = src;
    return deferred.promise();
}

/**
 * Checks any saved data for stale references to Mash previously existing in
 * the data source and cleans up the garbage before proceeding. Mash is an
 * immutable unit in all accounts, and with her recent (as of 2025/05/01)
 * shenanigans in JP with her upgrade to a Shielder Paladin and additional
 * change in rarity to SSR, it's easier to just stop tracking her altogether.
 */
function sanitizeStaleMashData() {
    if (Config.user_data.hasOwnProperty("3-0")) {
        delete Config.user_data["3-0"];
        console.log("Mash cleanup executed");
    }
}
//#endregion

//#region AJAX & API HANDLING
/*****************************************************************************/
/*                             AJAX & API HANDLING                           */
/*****************************************************************************/
/**
 * Shortens the current data URL and returns the shortened URL. Multiple
 * providers are configured to be polled, and the returned URL will be from the
 * provider that responds the fastest.
 */
async function shortenURL() {
    if (Config.compress_input === "")
    { showAlert(Config.share_none_text); return; } // Warn user if no data
    // Gather the full URL for shortening
    updateURLOptionModeOnly();
    const currentParams = new URLSearchParams(location.search);
    if (!currentParams.has(Config.compress_input_parameter))
    { updateURL(); }
    var full_url = `${location.origin}${location.pathname}${location.search}`;
    full_url = full_url.replace(/localhost|127\.0\.0\.1/g, "fgotest.tld");
    /*******************************/
    /*     Shortening services     */
    /*******************************/
    /**
     * Shortens the current data URL with waa.ai/Akari-chan shortener.
     * @returns {Promise<void>} A promise that resolves upon successfully
     *                          shortening the current URL.
     */
    function waaai() {
        return new Promise((resolve, reject) => {
            const ajaxdata = JSON.stringify({ url: full_url });
            $.ajax({
                headers: {
                    Authorization:
                        "API-Key 394562B4722f313b7392d97f7ea68f1cf9Df958b"
                },
                url: "https://api.waa.ai/v2/links",
                dataType: "json",
                contentType: "application/json",
                method: "POST",
                data: ajaxdata,
                success: (result) => resolve({ serviceProvider: "Akari-chan",
                    value: result.data.link }),
                error: (xhr, status, error) => 
                    reject(new Error(`Akari-chan error: ${status} - ${error}`))
            });
        });
    }
    /**
     * Shortens the current data URL with is.gd shortener.
     * @returns {Promise<void>} A promise that resolves upon successfully
     *                          shortening the current URL.
     */
    function isgd() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://is.gd/create.php",
                dataType: "json",
                data: { format: "json", url: full_url },
                success: (result) => resolve({ serviceProvider: "is.gd",
                    value: result.shorturl }),
                error: (xhr, status, error) =>
                    reject(new Error(`is.gd error: ${status} - ${error}`))
            });
        });
    }
    /**
     * Shortens the current data URL with owo.vc shortener.
     * @returns {Promise<void>} A promise that resolves upon successfully
     *                          shortening the current URL.
     */
    function owo() {
        return new Promise((resolve, reject) => {
            const ajaxdata = JSON.stringify({ link: full_url,
                generator: "owo", metadata: "IGNORE" });
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                url: "https://owo.vc/api/v2/link",
                method: "POST",
                dataType: "json",
                data: ajaxdata,
                success: (result) =>
                    resolve({ serviceProvider: "owo", value: result.id }),
                error: (xhr, status, error) =>
                    reject(new Error(`owo error: ${status} - ${error}`))
            });
        });
    }
    const shortProviders = [isgd(), waaai(), owo()];
    //const shortProviders = [()];      // used for testing new providers
    try {
        const result = await Promise.any(shortProviders);
        if (!result || !result.value) { throw new
            Error("All shortening services failed."); }
        return result.value;
    } catch (err) {
        console.error('Shortening failed:', err);
        return undefined;
    }
}

/**
 * Uses the Atlas Academy API to get the internal game ID of the latest Servant
 * released, in the global/EN server, in order to know when to construct NA/EN
 * links to the the Atlas Academy Database Servant pages. Slightly rewritten to
 * not use `$collection.at()` anymore since certain older versions of browsers
 * don't seem to support it.
 * @returns {Promise<void>} A promise that resolves when the fetch is complete.
 */
async function fetchGlobalThreshold() {
    try {
        const response =
            await fetch    // get *all* NA release IDs
                ("https://api.atlasacademy.io/export/NA/basic_servant.json");
        if (!response.ok)   // ensure successful response
            { throw new Error(`Network error: ${response.status}}`); }
        const NAreleases = await response.json();
        Config.globalThreshold = 
            NAreleases[NAreleases.length - 1].collectionNo;  // get last NA ID
    } catch (error) {
        console.error(error);
        $(".newFeature").addClass("JPdisabled");
        $("label[for='NAonly']").addClass("JPdisabled");
        $("#NAonly").prop("disabled", true);
        showAlert(Config.threshold_error);
    }
}
//#endregion