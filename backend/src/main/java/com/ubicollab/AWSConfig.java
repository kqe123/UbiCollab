package com.ubicollab;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.rekognition.RekognitionClient;

@Configuration
public class AWSConfig {
	// S3 Presigned URI 발급해주는 S3 Presigner 객체
    @Bean
    public S3Presigner s3Presigner(@Value("${AWS_S3_REGION}") String region,
    		@Value("${AWS_ACCESS_KEY_ID}") String accessKeyId,
            @Value("${AWS_SECRET_ACCESS_KEY}") String secretAccessKey) {
    	
    	AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKeyId, secretAccessKey); // 퍼블릭 키,비밀키로 자격증명을 생성
    	
    	// S3 Presigned URI 발급해주는 S3Presigner 객체를 만든다.
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials)) // 자격증명을 넣어줘야 한다.
                .build(); 
    }
    
    // 백엔드가 직접 PUT/GET/DELETE 등  S3 오퍼레이션을 실행할 때 쓰는 클라이언트
    @Bean
    public S3Client s3Client(@Value("${AWS_S3_REGION}") String region,
            @Value("${AWS_ACCESS_KEY_ID}") String accessKeyId,
            @Value("${AWS_SECRET_ACCESS_KEY}") String secretAccessKey) {

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials)) // 자격증명을 넣어줘야 한다.
                .build();
    }
    
    // AWS Rekognition 클라이언트를 Bean으로 추가
    // 사용 목적:이미지 유해 콘텐츠 검사(DetectModerationLabels 등)
    @Bean
    public RekognitionClient rekognitionClient(@Value("${AWS_S3_REGION}") String region,
            @Value("${AWS_ACCESS_KEY_ID}") String accessKeyId,
            @Value("${AWS_SECRET_ACCESS_KEY}") String secretAccessKey) {

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        return RekognitionClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}

