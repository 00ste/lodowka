/**
 * The default item.
 */
// i love javascript
const DEFAULT_ITEM = { name: "", date: (new Date()).toISOString().slice(0, 10) };

// ====================================
// STATE MANAGEMENT
// ====================================

let state_items = []

function _state_load_from_localstorage() {
    // Update state
    items_json = localStorage.getItem("_items");
    if (!items_json) {
        state_items = [];
    }
    else {
        state_items = JSON.parse(items_json);
    }
    
    // Update UI
    _get_items_container().innerHTML = _items_generator(state_items);
    callbacks_generator(state_items);
}

function _state_store_to_localstorage() {
    // Store state
    localStorage.setItem("_items", JSON.stringify(state_items));
}

function _state_render_and_store() {
    // Update UI
    _get_items_container().innerHTML = _items_generator(state_items);
    callbacks_generator(state_items);

    // Store state
    _state_store_to_localstorage();
}

function _state_add_item(item) {
    // Update state
    state_items.push(item);

    // Render and store
    _state_render_and_store();
}

function _state_delete_item(index) {
    // Update state
    state_items.splice(index, 1);

    // Render and store
    _state_render_and_store();
}

function _state_edit_item(index, item) {
    // Update state
    state_items[index] = item;

    // Render and store
    _state_render_and_store();
}

// ====================================
// UI GENERATION
// ====================================

function _get_items_container() {
    return document.getElementById("items-container");
}

/**
 * Generate the HTML of an item.
 * Rewrite this function for your own application.
 * @param {*} item The item data
 * @param {*} index The index of the item in the list of items
 * @returns The HTML as a single string.
 */
function item_generator(item, index) {
    const today = new Date();
    const days_left = Math.floor((new Date(item.date) - today) / (1000 * 60 * 60 * 24)) + 1;
    let c = "";
    if (days_left <= 3) c = "warning";
    if (days_left <= 0) c = "expired";

    return `<tr class="item">
        <td>
            <input  class="item-name" type="text" id="item-${index}-name" value="${item.name}" placeholder="Enter the name...">
        </td>
        <td>
            <input class="item-date" type="date" id="item-${index}-date" value="${item.date}">
        </td>
        <td>
            <p class="item-daysleft ${c}">${days_left}</p>
        </td>
        <td>
            <button class="item-delete" onclick="_item_delete(${index})">✘</button>
        </td>
    </tr>`;
}

function _items_generator(items) {
    if (items.length == 0) {
        return "<p class=\"noitem\">Start by adding a new item or importing items.</p>"
    }

    new_items = "<thead><tr><td>Item</td><td>Expiration date</td><td>Days left</td></tr></thead><tbody>";

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Generate HTML items
        new_items += item_generator(item, i);
    }

    new_items += "</tbody>";

    return new_items;
}

/**
 * Assign the callback functions for when the items are modified.
 * @param {*} items The list of items
 * @returns undefined.
 */
function callbacks_generator(items) {
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        
        form_item = document.getElementById(`item-${index}-name`);
        if (!form_item) return;
        form_item.addEventListener(
            "change",
            (e) => _state_edit_item(index, { ...item, name: e.target.value })
        );

        date_item = document.getElementById(`item-${index}-date`);
        if (!date_item) return;
        date_item.addEventListener(
            "change",
            (e) => _state_edit_item(index, { ...item, date: e.target.value })
        )
    }
}

// ====================================
// USER INTERFACE CALLBACKS
// ====================================

function _item_add_new() {
    _state_add_item(DEFAULT_ITEM, _get_items_container());
}

function _item_delete(index) {
    _state_delete_item(index, _get_items_container());
}

function _items_export_to_file() {
    const contents = JSON.stringify(state_items);
    const name = "items.json";

    // This is really stupid but it's kinda acceptable i guess (it's really not, but well)
    let element = document.createElement("a");
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(contents));
    element.setAttribute("download", name);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function _items_import_from_file() {
    const hidden_file_input = document.getElementById("import-file");
    if (!hidden_file_input) return;

    hidden_file_input.click();
}

function _init() {
    _state_load_from_localstorage();

    // I don't even want to begin describing my feelings about the next 20 lines of code
    // Credit: https://www.geeksforgeeks.org/javascript/how-to-read-a-local-text-file-using-javascript/
    document.getElementById("import-file").addEventListener(
        "change",
        (e) => {
            file = e.target.files[0];
            reader = new FileReader();
            reader.onload = () => {
                // Update state
                items_json = reader.result;
                state_items = JSON.parse(items_json);
                
                // Update UI
                _get_items_container().innerHTML = _items_generator(state_items);
                callbacks_generator(state_items);

                // Store state
                _state_store_to_localstorage()
            };

            reader.readAsText(file);
        }
    );
}