import pandas as pd

def load_synthea_data():
    patients = pd.read_csv('data/patients.csv')
    conditions = pd.read_csv('data/conditions.csv')
    observations = pd.read_csv('data/observations.csv')

    patient_data = []
    for patient_id in patients['Id'].unique():
        patient_info = patients[patients['Id'] == patient_id].iloc[0]
        patient_conditions = conditions[conditions['PATIENT'] == patient_id]
        patient_obs = observations[observations['PATIENT'] == patient_id]

        profile = f"Patient ID: {patient_id}\n"
        profile += f"Name: {patient_info['FIRST']} {patient_info['LAST']}\n"
        profile += f"Gender: {patient_info['GENDER']}, Birthdate: {patient_info['BIRTHDATE']}\n\n"
        profile += "Conditions:\n"
        for _, row in patient_conditions.iterrows():
            profile += f" - {row['DESCRIPTION']} (Start: {row['START']}, Stop: {row['STOP']})\n"

        profile += "\nObservations:\n"
        for _, row in patient_obs.iterrows():
            profile += f" - {row['DESCRIPTION']}: {row['VALUE']} {row['UNITS']} (Date: {row['DATE']})\n"

        patient_data.append((patient_id, profile))

    import pickle
    with open('data/patient_records.json', 'wb') as f:
        pickle.dump(patient_data, f)

    return patient_data


# Execute this function
patientdata = load_synthea_data()
print(patientdata[0])
