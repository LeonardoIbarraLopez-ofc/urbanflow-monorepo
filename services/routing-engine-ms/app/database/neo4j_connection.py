# neo4j_connection.py — Driver de conexión y pool de sesiones para Neo4j AuraDB.
# Usa el driver oficial de Python de Neo4j con reconexión automática.
# AuraDB requiere URI con protocolo neo4j+s:// para conexión cifrada TLS.

from neo4j import GraphDatabase, Driver
from app.config import get_settings


class Neo4jConnection:
    def __init__(self):
        self.driver: Driver | None = None
        self._settings = get_settings()

    def connect(self):
        """Abre la conexión al clúster Neo4j AuraDB."""
        self.driver = GraphDatabase.driver(
            self._settings.neo4j_uri,
            auth=(self._settings.neo4j_username, self._settings.neo4j_password),
            # Pool de hasta 50 sesiones concurrentes para soportar carga del hackatón
            max_connection_pool_size=50,
        )
        # Verificar conectividad al arrancar; falla rápido si las credenciales son incorrectas
        self.driver.verify_connectivity()

    def close(self):
        """Cierra el driver y libera las conexiones del pool."""
        if self.driver:
            self.driver.close()

    def get_session(self):
        """Retorna una sesión de Neo4j lista para ejecutar consultas Cypher."""
        if not self.driver:
            raise RuntimeError("Neo4j driver no inicializado; llamar connect() primero")
        return self.driver.session()
