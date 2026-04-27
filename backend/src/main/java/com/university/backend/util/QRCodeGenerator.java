package com.university.backend.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Slf4j
@Component
public class QRCodeGenerator {

    /**
     * Generate a QR code as Base64 encoded PNG
     * @param data The data to encode in the QR code
     * @param width Width of the QR code
     * @param height Height of the QR code
     * @return Base64 encoded PNG string (can be used as data:image/png;base64,...)
     */
    public String generateQRCodeBase64(String data, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

            byte[] pngData = pngOutputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(pngData);

            return "data:image/png;base64," + base64Image;
        } catch (Exception e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("QR code generation failed: " + e.getMessage());
        }
    }

    /**
     * Generate a check-in data string for a booking
     * Format: booking_{bookingId}_{timestamp}
     */
    public String generateCheckInData(Long bookingId) {
        return String.format("booking_%d_%d", bookingId, System.currentTimeMillis());
    }
}
