import React from 'react';
import { pdf } from '@react-pdf/renderer'; // react-pdf의 pdf 함수를 사용하여 PDF를 생성
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 한글 폰트 추가
import notoSansKR from './assets/NotoSansKR-VariableFont_wght.ttf'; // 실제 폰트 파일 경로로 수정

// 폰트를 등록합니다.
Font.register({
    family: 'NotoSansKR',
    src: notoSansKR
});

// 스타일 정의
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'NotoSansKR',
    },
    title: {
        fontSize: 13,
        fontFamily: 'NotoSansKR',
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black', // 글씨 색상 검정으로 설정
    },
    table: {
        display: 'table',
        width: '100%',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ddd',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: 11,
    },
    tableRow: {
        display: 'table-row',
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
    },
    tableCell: {
        display: 'table-cell',
        padding: 4,
        fontFamily: 'NotoSansKR',
        textAlign: 'center',
        borderBottom: '1px solid #ddd',
        width: '25%',
        fontSize: 11,
    },
    section: {
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'NotoSansKR',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 15, // margin-top 추가하여 간격을 넓힘
        color: 'black', // 글씨 색상 검정으로 설정
    },
    // 특이사항 부분 스타일 추가
    textArea: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: 'NotoSansKR',
        padding: 4,
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        minHeight: 50, // 최소 높이 설정
        marginBottom: 20,
        color: 'black', // 글씨 색상 검정으로 설정
    }
});

// PDF 생성 함수
const generatePDF = (selectedWorkOrder, materials) => {

    // materials가 undefined일 경우 빈 배열로 처리
    materials = materials || []; // 자재 정보가 없을 때 빈 배열 처리

    if (!selectedWorkOrder || materials.length === 0) {
        console.error("작업지시서 정보나 자재 정보가 없습니다.");
        return;
    }

    const pdfDoc = (
        <Document>
            <Page style={styles.page}>
                {/* 작업지시서 정보 표 */}
                <Text style={styles.sectionTitle}>작업지시정보</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>작업지시번호</Text>
                        <Text style={styles.tableCell}>작업조</Text>
                        <Text style={styles.tableCell}>생산시작일</Text>
                        <Text style={styles.tableCell}>생산종료일</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{selectedWorkOrder.lotNo}</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.workTeam}</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.startDate}</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.endDate}</Text>
                    </View>
                </View>
                {/* 생산정보 표 */}
                <Text style={styles.sectionTitle}>생산정보</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>제품명</Text>
                        <Text style={styles.tableCell}>수량</Text>
                        <Text style={styles.tableCell}>생산라인</Text>
                        <Text style={styles.tableCell}>작업지시상태</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{selectedWorkOrder.productName}</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.planQty} ea</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.lineNo} LINE</Text>
                        <Text style={styles.tableCell}>{selectedWorkOrder.processStatus}</Text>
                    </View>
                </View>

                {/* 자재정보 표 추가 */}
                <Text style={styles.sectionTitle}>자재정보</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>공정</Text>
                        <Text style={styles.tableCell}>자재명</Text>
                        <Text style={styles.tableCell}>맥주 1개 소요량</Text>
                        <Text style={styles.tableCell}>총 소요량</Text>
                    </View>
                    {materials.length > 0 ? (
                        materials.map((material) => (
                            <View key={material.lineMaterialId} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{material.processStep}</Text>
                                <Text style={styles.tableCell}>{material.materialName}</Text>
                                <Text style={styles.tableCell}>{material.requiredQtyPerUnit} {material.unit}</Text>
                                <Text style={styles.tableCell}>{material.totalQty} {material.unit}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell} colSpan={4}>자재 정보가 없습니다.</Text>
                        </View>
                    )}
                </View>

                {/* 특이사항 */}
                <Text style={styles.sectionTitle}>특이사항</Text>
                <Text style={styles.textArea}>{selectedWorkOrder.workEtc}</Text>
            </Page>
        </Document>
    );

    // pdf() 함수로 PDF를 동적으로 생성하고, blob으로 다운로드 링크 생성
    pdf(pdfDoc).toBlob().then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedWorkOrder.lotNo}_작업지시서.pdf`;

        link.click();
    }).catch((error) => {
        console.error("PDF 생성 중 오류 발생:", error);
    });
};

export default generatePDF;
