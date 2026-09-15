package com.ubicollab;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PepperedPasswordEncoder implements PasswordEncoder {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final PasswordEncoder delegate; // 실제 해싱은 BCrypt에게 위임
    private final String pepper;

    public PepperedPasswordEncoder(PasswordEncoder delegate, String pepper) {
        this.delegate = delegate;
        this.pepper = pepper;
    }
    
    // 비밀번호 저장할 때 쓰는 메서드
    // 즉 DB에 저장되는 최종 값은 BCrypt(HMAC-SHA256(rawPassword, pepper))
    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(applyPepper(rawPassword));
    }
    
    // 로그인 시 검증할 때 쓰는 메서드
    // 기존 해시값과 입력된 비밀번호를 해시값으로 바꾼뒤 비교한다.
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return delegate.matches(applyPepper(rawPassword), encodedPassword);
    }

    // 원문 비밀번호 + pepper → HMAC-SHA256 algorithm →  Base64 문자열을 만드는 메서드
    // 왜 그냥 문자열 이어붙이기(password + pepper)가 아니라 HMAC을 쓰냐? : BCrypt는 입력 길이가 72바이트를 넘으면 뒷부분을 잘라버리는 특성이 있음.
    // HMAC-SHA256으로 먼저 섞으면 비밀번호 길이와 무관하게 항상 고정 길이(32바이트 → Base64로 44자)로 나와서 이 문제를 원천적으로 피할 수 있음. 
    private String applyPepper(CharSequence rawPassword) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(pepper.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] hmacBytes = mac.doFinal(rawPassword.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Pepper 적용 중 오류가 발생했습니다.", e);
        }
    }
}