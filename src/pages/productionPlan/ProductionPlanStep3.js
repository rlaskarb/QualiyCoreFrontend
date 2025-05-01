import { useState, useEffect, useMemo } from "react";
import { ShoppingCart } from 'lucide-react';
import { 
    calculateMaterialRequirements, 
    saveMaterialPlan 
} from '../../apis/productionPlanApi/ProductionPlanStep3Api';
import styles from '../../styles/productionPlan/ProductionPlanStep3.module.css';
import { aggregateMaterialsByBeer, aggregateMaterials } from '../../utils/materialUtils';
import MaterialRequestModal from './MaterialRequestModal';
import { useNavigate } from "react-router-dom";
import SuccessAnimation from "../../lottie/SuccessNotification"; // ✅ 성공 애니메이션 추가

const ProductionPlanStep3 = ({ formData, setFormData, goToStep, currentStep = 3 }) => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [packagingMaterials, setPackagingMaterials] = useState([]);
    const [rawMaterialsByBeer, setRawMaterialsByBeer] = useState({});
    const [packagingMaterialsByBeer, setPackagingMaterialsByBeer] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBeer, setSelectedBeer] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false); // ✅ 성공 애니메이션 상태 추가
    const navigate = useNavigate(); 
    
    const uniqueBeers = useMemo(() => [...new Set(formData.products.map(p => p.productName))], [formData]);

    const aggregatedRawMaterials = useMemo(() => aggregateMaterials(rawMaterials), [rawMaterials]);
    const aggregatedPackagingMaterials = useMemo(() => aggregateMaterials(packagingMaterials), [packagingMaterials]);
    
    const filteredRawMaterials = useMemo(() => (
        selectedBeer
            ? rawMaterialsByBeer[selectedBeer] || [] // 선택한 맥주의 데이터만 보여줌
            : aggregatedRawMaterials // 전체 합산 데이터를 보여줌
    ), [selectedBeer, rawMaterialsByBeer, aggregatedRawMaterials]);
    
    const filteredPackagingMaterials = useMemo(() => (
        selectedBeer
            ? packagingMaterialsByBeer[selectedBeer] || []
            : aggregatedPackagingMaterials
    ), [selectedBeer, packagingMaterialsByBeer, aggregatedPackagingMaterials]);

    // 경고 배너 표시 로직 추가
    const hasShortageMaterilas = useMemo(() => {
        const rawMaterialShortage = rawMaterials.some(material => material.status === '부족');
        const packagingMaterialShortage = packagingMaterials.some(material => material.status === '부족');
        
        return rawMaterialShortage || packagingMaterialShortage;
    }, [rawMaterials, packagingMaterials]);

    const handleMaterialRequestSave = (materialRequests) => {
        setFormData(prevData => ({
            ...prevData,
            materialRequests: materialRequests
        }));
    };
    
    

    const formatNumber = (num, decimalPlaces = 4) => Number(num.toFixed(decimalPlaces));

    useEffect(() => {
        const fetchMaterialRequirements = async () => {
            try {
                const materialRequestData = {
                    planYm: formData.planYm,
                    products: formData.products.map(({ productId, productName, planQty }) => ({
                        productId,
                        productName,
                        planQty: parseInt(planQty)
                    }))
                };
        
                const response = await calculateMaterialRequirements(materialRequestData);
        
                const rawMaterialsData = response.result?.rawMaterials || [];
                const packagingMaterialsData = response.result?.packagingMaterials || [];
        
                // 맥주별 자재 분류
                const rawMaterialsByBeerMap = rawMaterialsData.reduce((acc, material) => {
                    const beerName = material.beerName;
                    if (!acc[beerName]) acc[beerName] = [];
                    acc[beerName].push(material);
                    return acc;
                }, {});
        
                const packagingMaterialsByBeerMap = packagingMaterialsData.reduce((acc, material) => {
                    const beerName = material.beerName;
                    if (!acc[beerName]) acc[beerName] = [];
                    acc[beerName].push(material);
                    return acc;
                }, {});
        
                setRawMaterials(rawMaterialsData);
                setPackagingMaterials(packagingMaterialsData);
                setRawMaterialsByBeer(rawMaterialsByBeerMap);
                setPackagingMaterialsByBeer(packagingMaterialsByBeerMap);
        
            } catch (error) {
                console.error('자재 정보 조회 중 오류:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        

        if (formData.planYm && formData.products.length > 0) {
            fetchMaterialRequirements();
        }
    }, [formData.planYm, formData.products]);
    
    

    const prepareDataForSave = (formData) => {
        const preparedData = {
            ...formData,
            planYm: formData.planYm || new Date().toISOString().split('T')[0], 
            allocatedLines: Object.values(formData.allocatedLines).flat(),
            materials: formData.materials || [],
            products: formData.products.map(product => ({
                ...product,
                planQty: Number(product.planQty)
            }))
        };
        return preparedData;
    };

    const handleSave = async () => {
        const preparedData = prepareDataForSave(formData);

        try {
            await saveMaterialPlan(preparedData);
            setShowSuccess(true);  // ✅ 성공 애니메이션 표시
            setTimeout(() => {
                navigate('/plan-overview');  // ✅ 애니메이션 후 페이지 이동
            }, 2000); // 2초 후 이동
        } catch (error) {
            console.error("저장 중 오류 발생:", error.response?.data);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <div>자재 정보를 불러오는 중...</div>;
    }
      
    return (
        <div className={styles.container}>
        {/* ✅ 성공 애니메이션 모달 */}
        {showSuccess && (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <SuccessAnimation />
                    <p className={styles.successText}>생산 계획이 성공적으로 저장되었습니다!</p>
                </div>
            </div>
        )}

        {/* ✅ 기존 UI (showSuccess가 false일 때만 보이게 함) */}
        {!showSuccess && (
            <>
                    <div className={styles.stepsContainer}>
                        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>기본정보</span>
                        </div>
                        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>공정정보</span>
                        </div>
                        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>자재정보</span>
                        </div>
                    </div>
    
                    <h2 className={styles.title}>자재 정보</h2>
    
                    {hasShortageMaterilas && (
                        <div className={styles.alertBanner}>
                            <span>❗ 일부 자재의 재고가 부족합니다. 구매신청이 필요합니다.</span>
                        </div>
                    )}
    
                    {/* 맥주 선택 버튼 추가 */}
                    <div className={styles.beerButtonGroup}>
                        <button 
                            className={selectedBeer === null ? styles.activeButton : ''}
                            onClick={() => setSelectedBeer(null)}
                        >
                            전체
                        </button>
                        {uniqueBeers.map(beer => (
                            <button
                                key={beer}
                                className={selectedBeer === beer ? styles.activeButton : ''}
                                onClick={() => setSelectedBeer(beer)}
                            >
                                {beer}
                            </button>
                        ))}
                    </div>
    
                    {/* 원자재 테이블 */}
                    <div className={styles.materialSection}>
                        <h3>{selectedBeer ? `${selectedBeer} 원자재` : "원자재"}</h3>
                        <table className={styles.materialTable}>
                            <thead>
                                <tr>
                                    <th>자재명</th>
                                    <th>단위</th>
                                    <th>기준소요량</th>  
                                    <th>계획소요량</th>
                                    {!selectedBeer && <th>현재재고</th>}
                                    {!selectedBeer && <th>상태</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRawMaterials.map((material, index) => (
                                    <tr key={index}>
                                        <td>{material.materialName}</td>
                                        <td>{material.unit}</td>
                                        <td>{formatNumber(material.stdQty)}</td>
                                        <td>{formatNumber(material.planQty)}</td>
                                        {!selectedBeer && <td>{formatNumber(material.currentStock)}</td>}
                                        {!selectedBeer && (
                                            <td>
                                                <span className={`${styles.statusBadge} ${material.status === '부족' ? styles.shortage : styles.sufficient}`}>
                                                    {material.status}
                                                </span>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    {/* 부자재 (포장재) */}
                    <div className={styles.materialSection}>
                        <h3>{selectedBeer ? `${selectedBeer} 부자재` : "부자재"}</h3>
                        <table className={styles.materialTable}>
                            <thead>
                                <tr>
                                    <th>자재명</th>
                                    <th>단위</th>
                                    <th>기준소요량</th>
                                    <th>계획소요량</th>
                                    {!selectedBeer && <th>현재재고</th>}
                                    {!selectedBeer && <th>상태</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackagingMaterials.map((material, index) => (
                                    <tr key={index}>
                                        <td>{material.materialName}</td>
                                        <td>{material.unit}</td>
                                        <td>{formatNumber(material.stdQty)}</td>
                                        <td>{formatNumber(material.planQty)}</td>
                                        {!selectedBeer && <td>{formatNumber(material.currentStock)}</td>}
                                        {!selectedBeer && (
                                            <td>
                                                <span className={`${styles.statusBadge} ${material.status === '부족' ? styles.shortage : styles.sufficient}`}>
                                                    {material.status}
                                                </span>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    {/* 버튼 */}
                    <div className={styles.buttonGroup}>
                        <button onClick={() => goToStep(2)} className={styles.prevButton}>이전</button>
                        <div className={styles.rightButtons}>
                            <MaterialRequestModal 
                                shortageMaterials={[...rawMaterials, ...packagingMaterials].filter(m => m.status === '부족')} 
                                onSave={handleMaterialRequestSave}
                            />
                            <button onClick={handleSave} className={styles.nextButton}>저장</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
    
};

export default ProductionPlanStep3;