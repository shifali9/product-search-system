import typesense

client = typesense.Client({
    "nodes": [{
        "host": "localhost",
        "port": "8108",
        "protocol": "http"
    }],
    "api_key": "xyz",
    "connection_timeout_seconds": 5
})

schema = {
    "name": "products",
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "main_category", "type": "string", "facet": True},
        {"name": "categories", "type": "string", "facet": True},
        {"name": "store", "type": "string", "facet": True},
        {"name": "average_rating", "type": "float"},
        {"name": "rating_number", "type": "int32"},
        {"name": "price", "type": "float"},
        {"name": "features", "type": "string"},
        {"name": "image", "type": "string"}
    ],
    "default_sorting_field": "rating_number"
}

try:
    client.collections.create(schema)
    print("✅ Collection created successfully!")
except Exception as e:
    print("❌ Error:", e)