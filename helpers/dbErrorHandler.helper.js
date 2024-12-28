const uniqueMessage = (error) => {
    let output;
    try {
        // Extrait le nom du champ unique concerné
        let fieldName = error.message.substring(
            error.message.lastIndexOf(".$") + 2,
            error.message.lastIndexOf("_1")
        );
        output =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1) +
            " already exists"; // Exemple : Email already exists
    } catch (ex) {
        output = "Unique field already exists";
    }

    return output;
};

/**
 * Get the error message from the error object
 */
exports.errorHandler = (error) => {
    let message = "";

    if (error.code) {
        switch (error.code) {
            case 11000: // Gestion des doublons
            case 11001:
                message = uniqueMessage(error); // Appelle uniqueMessage()
                break;
            default:
                message = "Something went wrong"; // Message générique
        }
    } else {
        for (let errorName in error.errors) {
            if (error.errors[errorName].message) {
                message = error.errors[errorName].message;
            }
        }
    }

    return message;
};
