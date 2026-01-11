import java.util.Map;
import java.util.TreeMap;

/**
 * A robust URL Builder implementing the Fluent API pattern.
 * Features:
 * - Automatic query parameter sorting (using TreeMap).
 * - Smart path handling (prevents double slashes).
 * - Standard port handling (omits 80 for http, 443 for https).
 */
public class UrlBuilder {
    private String scheme = "http";
    private String host = "";
    private int port = -1;
    private String path = "";
    private Map<String, String> queryParams = new TreeMap<>(); // TreeMap ensures consistent parameter order

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

        // Append port only if it's non-standard
        if (port != -1) {
            boolean isStandardHttp = "http".equals(scheme) && port == 80;
            boolean isStandardHttps = "https".equals(scheme) && port == 443;
            
            if (!isStandardHttp && !isStandardHttps) {
                url.append(":").append(port);
            }
        }

        if (path != null && !path.isEmpty()) {
            // Ensure path starts with exactly one '/'
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
}