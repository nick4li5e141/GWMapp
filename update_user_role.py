import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT_KEY_PATH = 'serviceAccountKey.json'

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.")
    exit()

db = firestore.client()

# User details to update
user_email_to_update = "nikoulasabeh@yahoo.com"

# Reference to the user document
user_doc_ref = db.collection('gwm').document(user_email_to_update)

try:
    # Get the current data to preserve existing fields
    current_user_data = user_doc_ref.get().to_dict()

    if current_user_data:
        # Update the specific fields
        current_user_data['role'] = 'user'

        # Correct the typo if 'adress' exists and 'adress' does not
        if 'adress' in current_user_data and 'adress' not in current_user_data:
            current_user_data['adress'] = current_user_data.pop('adress') # Renames 'adress' to 'adress'
        elif 'adress' in current_user_data and 'adress' in current_user_data:
            # If both exist, prioritize 'adress' and remove 'adress'
            current_user_data.pop('adress')


        user_doc_ref.set(current_user_data) # Overwrites with updated data
        print(f"User '{user_email_to_update}' updated in Firestore successfully with role 'user' and corrected adress field!")
        print("Updated user data:", current_user_data)
    else:
        print(f"User '{user_email_to_update}' not found in Firestore. Please ensure the email is correct.")

except Exception as e:
    print(f"Error updating user in Firestore: {e}")
    print("Please check your Firestore security rules and ensure the 'gwm' collection allows write operations.") 