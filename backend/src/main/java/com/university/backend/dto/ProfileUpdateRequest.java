package com.university.backend.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String mobile;
    private String nic;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
}
