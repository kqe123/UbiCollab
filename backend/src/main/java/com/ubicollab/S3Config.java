package com.ubicollab;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {
    @Bean
    public S3Presigner s3Presigner(@Value("${AWS_S3_REGION}") String region,
    		@Value("${AWS_ACCESS_KEY_ID}") String accessKeyId,
            @Value("${AWS_SECRET_ACCESS_KEY}") String secretAccessKey) {
    	
    	AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKeyId, secretAccessKey); // 퍼블릭 키,비밀키로 자격증명을 생성
    	
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials)) // 자격증명을 넣어줘야 한다.
                .build(); 
    }
}

