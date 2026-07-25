import typesense

# Connect to Typesense
client = typesense.Client({
    "nodes": [{
        "host": "localhost",
        "port": "8108",
        "protocol": "http"
    }],
    "api_key": "xyz",
    "connection_timeout_seconds": 60
})

# Search query
search_parameters = {
    "q": "adidas",
    "query_by": "title,description,features,store",
    "per_page": 10
}

# Perform search
results = client.collections["products"].documents.search(search_parameters)

print(f"\nFound {results['found']} products\n")

for hit in results["hits"]:
    product = hit["document"]

    print("-" * 60)
    print("Title      :", product["title"])
    print("Store      :", product["store"])
    print("Category   :", product["main_category"])
    print("Price      :", product["price"])
    print("Rating     :", product["average_rating"])
    print("Image URL  :", product["image"])