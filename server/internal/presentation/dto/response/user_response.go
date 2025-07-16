package response

// LoginResponse defines the structure for a successful login response.
type LoginResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
}
