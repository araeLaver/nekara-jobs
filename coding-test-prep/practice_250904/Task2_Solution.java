import java.util.Map;
import java.util.TreeMap;

public class UrlBuilder {
    private String scheme = "http";
    private String host = "";
    private int port = -1;
    private String path = "";
    private Map<String, String> queryParams = new TreeMap<>(); // TreeMap for sorted keys

    public UrlBuilder https() {
        this.scheme = "https";
        return this;
    }

    public UrlBuilder host(String host) {
        this.host = host;
        return this;
    }

    public UrlBuilder port(int port) {
        this.port = port;
        return this;
    }

    public UrlBuilder path(String path) {
        this.path = path;
        return this;
    }

    public UrlBuilder queryParams(Map<String, String> queryParams) {
        if (queryParams != null) {
            this.queryParams.putAll(queryParams);
        }
        return this;
    }

    public String build() {
        StringBuilder url = new StringBuilder();

        url.append(scheme).append("://");
        url.append(host);

        if (port != -1) {
            url.append(":").append(port);
        }

        if (path != null && !path.isEmpty()) {
            if (!path.startsWith("/")) {
                url.append("/");
            }
            url.append(path);
        }

        if (!queryParams.isEmpty()) {
            url.append("?");
            boolean first = true;
            for (Map.Entry<String, String> entry : queryParams.entrySet()) {
                if (!first) {
                    url.append("&");
                }
                url.append(entry.getKey()).append("=").append(entry.getValue());
                first = false;
            }
        }

        return url.toString();
    }
    
    // Test logic similar to the original file
    public static void main(String[] args) {
        System.out.println(new UrlBuilder().host("codility.com").https().port(8080).build());
    }
}
