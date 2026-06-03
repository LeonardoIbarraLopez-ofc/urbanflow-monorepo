from neo4j import GraphDatabase

class RoutingEngine:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def find_multimodal_route(self, start_node, end_node, alpha=0.5, beta=0.3, gamma=0.2):
        with self.driver.session() as session:
            # Query Cypher utilizando el algoritmo de camino mínimo (A* o Dijkstra) con tu función de peso
            query = """
            MATCH (start:TransitStation {name: $start_node}), (end:TransitStation {name: $end_node})
            MATCH p = shortestPath((start)-[:CONNECTED*..15]->(end))
            RETURN p
            """
            result = session.run(query, start_node=start_node, end_node=end_node)
            return result.single()