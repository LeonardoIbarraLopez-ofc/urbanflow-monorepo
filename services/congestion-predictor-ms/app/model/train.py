#!/usr/bin/env python3
# train.py — Script offline de entrenamiento del modelo autorregresivo de congestión.
# Consume datos históricos de tráfico desde AWS S3 (Data Lake de la alcaldía, 10 años).
# Entrena el modelo y lo persiste como congestion_model.pkl para ser cargado por predictor.py.
# Ejecutar: python -m app.model.train

import os
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error


def load_historical_data(parquet_path: str) -> pd.DataFrame:
    """Carga datos históricos de velocidades de buses desde un archivo Parquet del Data Lake."""
    return pd.read_parquet(parquet_path)


def build_features(df: pd.DataFrame, window: int = 10) -> tuple:
    """
    Construye features autorregresivas: las últimas `window` muestras de velocidad
    más el factor climático predicen la densidad futura.
    """
    features, targets = [], []
    for i in range(window, len(df)):
        lag_speeds = df['avg_speed_kmh'].iloc[i - window:i].tolist()
        climate = df['weather_factor'].iloc[i]
        lag_speeds.append(climate)
        features.append(lag_speeds)
        targets.append(df['congestion_density'].iloc[i])
    return features, targets


def train(data_path: str, output_path: str = 'app/model/congestion_model.pkl'):
    df = load_historical_data(data_path)
    X, y = build_features(df)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    mse = mean_squared_error(y_test, model.predict(X_test))
    print(f"Modelo entrenado. MSE en test: {mse:.4f}")

    joblib.dump(model, output_path)
    print(f"Modelo persistido en: {output_path}")


if __name__ == '__main__':
    # Ruta local al Parquet histórico descargado del bucket S3 de la alcaldía
    data_path = os.getenv('TRAINING_DATA_PATH', 'data/historical_traffic.parquet')
    train(data_path)
